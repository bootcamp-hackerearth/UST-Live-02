export const validateEmailFormat = (email: string): boolean => {
  const trimmedEmail = email.trim();

  const emailRegex =
    /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

  return emailRegex.test(trimmedEmail);
};

export const hasSpaces = (value: string): boolean => {
  return /\s/.test(value);
};

const commonDomains = [
  "gmail.com",
  "yahoo.com",
  "outlook.com",
  "hotmail.com",
];

const getDifferenceCount = (
  value: string,
  target: string
): number => {
  let differences = Math.abs(
    value.length - target.length
  );

  const minLength = Math.min(
    value.length,
    target.length
  );

  for (let index = 0; index < minLength; index++) {
    if (value[index] !== target[index]) {
      differences++;
    }
  }

  return differences;
};

const getSuggestedDomain = (
  domain: string
): string => {
  for (const commonDomain of commonDomains) {
    const difference = getDifferenceCount(
      domain,
      commonDomain
    );

    if (
      difference <= 2 &&
      domain !== commonDomain
    ) {
      return commonDomain;
    }
  }

  return "";
};

const validateBasicEmailRules = (
  email: string
): string => {
  if (!email) {
    return "Email is required";
  }

  if (hasSpaces(email)) {
    return "Email should not contain spaces";
  }

  if (!validateEmailFormat(email)) {
    return "Please enter a valid email address";
  }

  return "";
};

const validateEmailUserName = (
  localPart: string
): string => {
  if (!localPart) {
    return "Please enter a valid email address";
  }

  if (
    localPart.startsWith(".") ||
    localPart.endsWith(".")
  ) {
    return "Email username is not valid";
  }

  if (localPart.includes("..")) {
    return "Email username should not contain consecutive dots";
  }

  return "";
};

const validateEmailDomain = (
  domain: string
): string => {
  if (!domain) {
    return "Please enter a valid email address";
  }

  if (domain.includes("..")) {
    return "Email domain should not contain consecutive dots";
  }

  if (
    domain.startsWith("-") ||
    domain.endsWith("-")
  ) {
    return "Email domain is not valid";
  }

  return "";
};

const validateDomainExtension = (
  domainParts: string[]
): string => {
  if (domainParts.length < 2) {
    return "Please enter a valid email address";
  }

  const extension =
    domainParts.at(-1) ?? "";

  if (extension.length > 3) {
    return "Email domain extension looks invalid";
  }

  return "";
};

const validateGmailDomain = (
  domain: string,
  localPart: string
): string => {
  if (domain !== "gmail.com") {
    return "Please check your email domain. Did you mean gmail.com?";
  }

  const gmailRegex =
    /^(?!\.)(?!.*\.\.)(?!.*\.$)[a-z0-9.]{6,30}$/;

  if (!gmailRegex.test(localPart)) {
    return "Email is invalid";
  }

  return "";
};

const validateKnownProviderDomain = (
  providerName: string,
  domain: string,
  localPart: string
): string => {
  if (providerName === "gmail") {
    return validateGmailDomain(
      domain,
      localPart
    );
  }

  const validProviderDomains: Record<
    string,
    string
  > = {
    yahoo: "yahoo.com",
    outlook: "outlook.com",
    hotmail: "hotmail.com",
  };

  const expectedDomain =
    validProviderDomains[providerName];

  if (
    expectedDomain &&
    domain !== expectedDomain
  ) {
    return `Please check your email domain. Did you mean ${expectedDomain}?`;
  }

  return "";
};

const validateDomainSuggestion = (
  domain: string
): string => {
  const suggestedDomain =
    getSuggestedDomain(domain);

  if (suggestedDomain) {
    return `Please check your email domain. Did you mean ${suggestedDomain}?`;
  }

  return "";
};

export const validateLoginEmail = (
  email: string
): string => {
  const trimmedEmail = email
    .trim()
    .toLowerCase();

  const basicError =
    validateBasicEmailRules(trimmedEmail);

  if (basicError) {
    return basicError;
  }

  const [localPart, domain] =
    trimmedEmail.split("@");

  const userNameError =
    validateEmailUserName(localPart);

  if (userNameError) {
    return userNameError;
  }

  const domainError =
    validateEmailDomain(domain);

  if (domainError) {
    return domainError;
  }

  const domainParts = domain.split(".");

  const extensionError =
    validateDomainExtension(domainParts);

  if (extensionError) {
    return extensionError;
  }

  const providerName = domainParts[0];

  const providerError =
    validateKnownProviderDomain(
      providerName,
      domain,
      localPart
    );

  if (providerError) {
    return providerError;
  }

  return validateDomainSuggestion(domain);
};

export const validateLoginPassword = (
  password: string
): string => {
  if (!password.trim()) {
    return "Password is required";
  }

  return "";
};

/*
 * First-login password-change validation
 */

export const validateNewPassword = (
  password: string
): string => {
  if (!password) {
    return "New password is required";
  }

  if (hasSpaces(password)) {
    return "Password should not contain spaces";
  }

  if (password.length < 8) {
    return "Password must contain at least 8 characters";
  }

  if (password.length > 64) {
    return "Password must not exceed 64 characters";
  }

  if (!/[A-Z]/.test(password)) {
    return "Password must contain at least one uppercase letter";
  }

  if (!/[a-z]/.test(password)) {
    return "Password must contain at least one lowercase letter";
  }

  if (!/[0-9]/.test(password)) {
    return "Password must contain at least one number";
  }

  if (!/[^A-Za-z0-9\s]/.test(password)) {
    return "Password must contain at least one special character";
  }

  return "";
};

export const validateConfirmPassword = (
  newPassword: string,
  confirmPassword: string
): string => {
  if (!confirmPassword) {
    return "Confirm password is required";
  }

  if (newPassword !== confirmPassword) {
    return "Passwords do not match";
  }

  return "";
};