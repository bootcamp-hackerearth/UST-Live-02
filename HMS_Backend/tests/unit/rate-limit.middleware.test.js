const createRateLimitMiddleware = require("../../src/middleware/rate-limit.middleware");

describe("rate-limit middleware", () => {
  test("blocks requests after the configured limit", () => {
    const middleware = createRateLimitMiddleware({
      windowMs: 60000,
      maxRequests: 2,
    });
    const req = {
      ip: "127.0.0.1",
      socket: {},
    };
    const next = jest.fn();

    middleware(req, {}, next);
    middleware(req, {}, next);
    middleware(req, {}, next);

    expect(next).toHaveBeenCalledTimes(3);
    expect(next.mock.calls[0][0]).toBeUndefined();
    expect(next.mock.calls[1][0]).toBeUndefined();
    expect(next.mock.calls[2][0].statusCode).toBe(429);
    expect(next.mock.calls[2][0].errorCode).toBe("RATE_LIMIT_EXCEEDED");
  });
});
