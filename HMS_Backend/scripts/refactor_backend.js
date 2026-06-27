const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..", "src");
const controllersDir = path.join(root, "controllers");
const servicesDir = path.join(root, "services");

function walk(dir, list = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, list);
    } else if (entry.isFile() && full.endsWith(".js")) {
      list.push(full);
    }
  }
  return list;
}

function relImport(fromFile, toFile) {
  const rel = path.relative(path.dirname(fromFile), toFile).replace(/\\/g, "/");
  return rel.startsWith(".") ? rel : `./${rel}`;
}

function classifyStatus(message) {
  const text = String(message || "").toLowerCase();

  if (
    /(not found|does not exist|no account|invalid .*id|invalid .*code|invalid .*format|user profile not found|consultation not found|appointment not found|employee not found|patient not found|doctor not found|record not found|account is inactive|your registration was rejected|your account is pending admin approval)/.test(
      text,
    )
  ) {
    return 404;
  }
  if (
    /(already exists|already registered|duplicate|duplicate key|conflict|already booked|already has an appointment|password has already been created|same password|email is already registered|phone number is already registered|medical registration number already exists|security question|password reset|cannot book appointment)/.test(
      text,
    )
  ) {
    return 409;
  }
  if (
    /(unauthorized|invalid token|invalid authorization|token required|refresh token|security answer is incorrect|invalid credentials|incorrect password|expired|temporary password|invalid login id)/.test(
      text,
    )
  ) {
    return 401;
  }
  if (
    /(access denied|forbidden|not allowed|must be|required|cannot|invalid designation|invalid .*request|doctor is currently unavailable|doctor is not available|selected slot falls|maximum patient limit|past dates|passwords do not match|confirm password)/.test(
      text,
    )
  ) {
    return 403;
  }
  if (
    /(validation failed|must be different|does not match|bad request|invalid .*password|selected slot|email.*already|phone.*already|medical registration|consultation already exists)/.test(
      text,
    )
  ) {
    return 400;
  }

  return 500;
}

function classifyCode(message) {
  const status = classifyStatus(message);
  if (status === 404) return "NOT_FOUND";
  if (status === 409) return "CONFLICT";
  if (status === 401) return "UNAUTHORIZED";
  if (status === 403) return "FORBIDDEN";
  if (status === 400) return "BAD_REQUEST";
  return "INTERNAL_SERVER_ERROR";
}

function ensureImport(content, importLine) {
  return content.includes(importLine) ? content : `${importLine}\n${content}`;
}

for (const file of walk(controllersDir)) {
  let content = fs.readFileSync(file, "utf8");
  content = ensureImport(
    content,
    'const asyncHandler = require("../utils/asyncHandler");',
  );
  content = ensureImport(
    content,
    'const ApiResponse = require("../utils/ApiResponse");',
  );

  content = content.replace(
    /const\s+(\w+)\s*=\s*async\s*\(([^)]*)\)\s*=>\s*\{/g,
    "const $1 = asyncHandler(async ($2) => {",
  );
  content = content.replace(
    /const\s+(\w+)\s*=\s*async\s*\(([^)]*)\)\s*=>\s*\{\s*try\s*\{/g,
    "const $1 = asyncHandler(async ($2) => {",
  );
  content = content.replace(
    /\n\s*} catch \(error\) \{[\s\S]*?\n\s*\}\n/g,
    "\n",
  );
  content = content.replace(/\n\s*console\.error\([^\)]*\);?\n/g, "\n");
  content = content.replace(/\n\s*try\s*\{\n/g, "\n");

  fs.writeFileSync(file, content);
}

for (const file of walk(servicesDir)) {
  let content = fs.readFileSync(file, "utf8");
  const apiErrorImport = `const ApiError = require("${relImport(file, path.join(root, "utils", "ApiError.js"))}");`;
  content = ensureImport(content, apiErrorImport);

  content = content.replace(
    /throw new Error\((['"`])((?:\\.|(?!\1)[^\\])*)\1\)/g,
    (_, quote, msg) => {
      return `throw new ApiError(${classifyStatus(msg)}, ${quote}${msg}${quote}, "${classifyCode(msg)}")`;
    },
  );

  content = content.replace(/throw new Error\(([^\n]+)\)/g, (match, expr) => {
    const trimmed = expr.trim();
    if (trimmed.startsWith("`") && trimmed.endsWith("`")) {
      const msg = trimmed.slice(1, -1);
      return `throw new ApiError(${classifyStatus(msg)}, ${trimmed}, "${classifyCode(msg)}")`;
    }
    return match;
  });

  fs.writeFileSync(file, content);
}

const appPath = path.join(root, "app.js");
let appContent = fs.readFileSync(appPath, "utf8");
appContent = appContent.replace(
  /\napp\.use\(\(error, req, res, next\) => \{[\s\S]*?\n\}\);\n?/g,
  "\n",
);
appContent = appContent.replace(
  /\napp\.use\(errorMiddleware\);\n?/g,
  "\napp.use(errorMiddleware);\n",
);
fs.writeFileSync(appPath, appContent);

console.log("Backend refactor script completed.");
