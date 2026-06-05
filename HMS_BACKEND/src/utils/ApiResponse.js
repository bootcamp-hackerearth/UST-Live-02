class ApiResponse {
    constructor(statusCode, data) {
        this.statusCode = statusCode;
        this.data = data;
        this.success = true;
    }

    toJSON() {
        return {
            statusCode: this.statusCode,
            data: this.data,
            success: this.success
        };
    }
}

module.exports = ApiResponse;
