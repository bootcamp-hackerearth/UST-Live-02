class ApiError extends Error {
    constructor(statusCode, message) {
        super(message);
        this.statusCode = statusCode;
        this.success = false;
    }
 
    toJSON() {
        return {
            success: this.success,
            message: this.message,
            statusCode: this.statusCode
        };
    }
}
module.exports = ApiError;
 