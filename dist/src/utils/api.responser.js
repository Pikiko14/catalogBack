"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deniedResponse = exports.noAuthorizedResponse = exports.unProcesableEntityResponse = exports.notFountResponse = exports.errorResponse = exports.createdResponse = exports.successResponse = void 0;
/**
 * Success response
 * @param {*} res
 * @param {*} data
 * @param {*} message
 */
const successResponse = (res, data, message) => {
    res.status(200).json({
        success: true,
        data,
        message
    });
};
exports.successResponse = successResponse;
/**
 * Create response
 * @param {*} res
 * @param {*} data
 * @param {*} message
 */
const createdResponse = (res, data, message) => {
    res.status(201).json({
        success: true,
        data,
        message
    });
};
exports.createdResponse = createdResponse;
/**
 * Error response
 * @param {*} res
 * @param {*} data
 * @param {*} message
 */
const errorResponse = (res, data, message) => {
    res.status(500).json({
        error: true,
        data,
        message
    });
};
exports.errorResponse = errorResponse;
/**
 * 404 response
 * @param {*} res
 * @param {*} data
 * @param {*} message
 */
const notFountResponse = (res, data, message) => {
    res.status(404).json({
        error: true,
        data,
        message
    });
};
exports.notFountResponse = notFountResponse;
/**
 * 404 response
 * @param {*} res
 * @param {*} data
 * @param {*} message
 */
const unProcesableEntityResponse = (res, data, message) => {
    res.status(422).json({
        error: true,
        data,
        message
    });
};
exports.unProcesableEntityResponse = unProcesableEntityResponse;
/**
 * 401 response
 * @param {*} res
 * @param {*} data
 * @param {*} message
 */
const noAuthorizedResponse = (res, data, message) => {
    res.status(401).json({
        error: true,
        data,
        message
    });
};
exports.noAuthorizedResponse = noAuthorizedResponse;
/**
 * 403 response
 * @param {*} res
 * @param {*} data
 * @param {*} message
 */
const deniedResponse = (res, data, message) => {
    res.status(403).json({
        error: true,
        data,
        message
    });
};
exports.deniedResponse = deniedResponse;
