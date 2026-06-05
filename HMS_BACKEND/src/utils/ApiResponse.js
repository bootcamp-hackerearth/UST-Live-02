class ApiResponse {

    constructor(statusCode, data) {
        this.statusCode = statusCode;
        this.data = data;
        this.success = true;
    }
}

module.exports = ApiResponse;