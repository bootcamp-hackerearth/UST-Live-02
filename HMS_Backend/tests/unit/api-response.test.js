const ApiResponse = require("../../src/utils/ApiResponse");
const ApiError = require("../../src/utils/ApiError");

describe("API DTO helpers", () => {
  test("ApiResponse creates a consistent success payload", () => {
    const response = new ApiResponse(200, "Done", { id: "1" });

    expect(response).toEqual({
      success: true,
      statusCode: 200,
      message: "Done",
      data: { id: "1" },
    });
  });

  test("ApiError carries status, code, details, and success=false", () => {
    const error = new ApiError(403, "Denied", "FORBIDDEN", {
      reason: "role",
    });

    expect(error.statusCode).toBe(403);
    expect(error.errorCode).toBe("FORBIDDEN");
    expect(error.details).toEqual({ reason: "role" });
    expect(error.success).toBe(false);
  });
});
