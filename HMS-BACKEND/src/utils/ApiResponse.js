
class ApiResponse {// NOSONAR - Constructor is required to initialize a consistent API response format
    constructor(statuscode, message, data = null) {
        this.success = statuscode < 400;
        this.statuscode = statuscode;
        this.message = message;
        this.data = data;
    }
}
module.exports = ApiResponse;