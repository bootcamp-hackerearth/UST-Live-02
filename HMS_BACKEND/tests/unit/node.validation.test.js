const { validationResult } = require("express-validator");

const {
  nodePayloadValidation,
} = require("../../src/validations/node.validation");

const runValidation = async (body) => {
  const req = {
    body,
  };

  await Promise.all(
    nodePayloadValidation.map((validation) => validation.run(req)),
  );

  return validationResult(req);
};

describe("node validation", () => {
  test("accepts a valid node payload", async () => {
    const result = await runValidation({
      name: "Node Management",
      path: "/node-management",
      icon: "account_tree",
      order: 90,
      roles: ["SUPER_ADMIN"],
      isActive: true,
      apiPermissions: [
        {
          method: "GET",
          path: "/api/nodes",
          roles: ["SUPER_ADMIN"],
        },
      ],
    });

    expect(result.isEmpty()).toBe(true);
  });

  test("rejects invalid route, role, method, and api path", async () => {
    const result = await runValidation({
      name: "X",
      path: "node-management",
      roles: ["OWNER"],
      apiPermissions: [
        {
          method: "FETCH",
          path: "/nodes",
        },
      ],
    });

    const messages = result.array().map((error) => error.msg);

    expect(messages).toContain("Node name must be 2 to 80 characters");
    expect(messages).toContain(
      "Node path must start with / and contain a valid route path",
    );
    expect(messages).toContain("Invalid node role");
    expect(messages).toContain("Invalid API permission method");
    expect(messages).toContain("API permission path must start with /api/");
  });
});
