"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handlerValidator = void 0;
const express_validator_1 = require("express-validator");
const api_responser_1 = require("./api.responser");
const handlerValidator = (req, res, next) => {
    try {
        (0, express_validator_1.validationResult)(req).throw();
        return next();
    }
    catch (error) {
        return (0, api_responser_1.unProcesableEntityResponse)(res, error.array(), 'Error request body');
    }
};
exports.handlerValidator = handlerValidator;
