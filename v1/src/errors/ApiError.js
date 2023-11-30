class ApiError extends Error {
    constructor(statusCode, message) {
        super(message);
        this.message = message;
        this.status = statusCode;
    }

    // static notFound() {
    //     this.message = "Böyle bir kayıt bulunmamaktadır.";
    //     this.status = 404;
    // }
}

module.exports = ApiError;