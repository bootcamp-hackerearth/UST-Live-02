class ApiResponse {//NOSONAR-Constructor is required to initialize a consistent API response format
    constructor(statusCode, data) {
        this.statusCode = statusCode;
        this.data = data;
        this.success = true;
    }

}

module.exports = ApiResponse;