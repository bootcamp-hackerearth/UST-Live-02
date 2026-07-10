function ApiResponse(statusCode, message = "Success", data = null) {
  return {
    success: true,
    statusCode,
    message,
    data,
  };
}

module.exports = ApiResponse;
