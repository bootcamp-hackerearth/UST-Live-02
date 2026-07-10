const roleMiddleware = require("../../src/middleware/role.middleware");

describe("roleMiddleware", () => {
  test("allows users with an allowed role", () => {
    const req = {
      user: {
        roles: ["SUPER_ADMIN"],
      },
    };
    const next = jest.fn();

    roleMiddleware("SUPER_ADMIN")(req, {}, next);

    expect(next).toHaveBeenCalledWith();
  });

  test("rejects users without an allowed role", () => {
    const req = {
      user: {
        roles: ["ADMIN"],
      },
    };
    const next = jest.fn();

    roleMiddleware("SUPER_ADMIN")(req, {}, next);

    expect(next.mock.calls[0][0].statusCode).toBe(403);
    expect(next.mock.calls[0][0].errorCode).toBe("FORBIDDEN");
  });
});
