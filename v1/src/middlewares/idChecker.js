const httpStatus = require("http-status");
const ApiError = require("../errors/ApiError");

const idChecker = (field) => (req, res, next) => {

    const idField = field || "id";
    if (!req?.params?.[idField]?.match(/^[0-9a-fA-F]{24}$/)) {
        next(new ApiError(httpStatus.BAD_REQUEST, "Lütfen geçerli bir ID giriniz."));
        return;
    }
    next();
};

module.exports = idChecker;