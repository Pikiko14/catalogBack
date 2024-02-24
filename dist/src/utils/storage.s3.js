"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateFilesSize = exports.validateFileSize = exports.uploadS3 = void 0;
const multer_1 = __importDefault(require("multer"));
const s3_service_1 = require("../services/aws/s3/s3.service");
const api_responser_1 = require("./api.responser");
// instanciate s3 service
new s3_service_1.S3Service();
// prepare multer
const storage = multer_1.default.memoryStorage();
const uploadS3 = (0, multer_1.default)({
    storage: storage,
});
exports.uploadS3 = uploadS3;
// Middleware para validar el tamaño del archivo
const validateFileSize = (req, res, next) => {
    if (req.file && req.file.size > 1000000) {
        return (0, api_responser_1.deniedResponse)(res, {}, 'File size exceeds 1MB limit.');
    }
    next();
};
exports.validateFileSize = validateFileSize;
const validateFilesSize = (req, res, next) => {
    const files = req.files;
    if (!files) {
        return (0, api_responser_1.deniedResponse)(res, {}, 'No file in request.');
    }
    for (const file of files) {
        if (file.size > 1000000) {
            return (0, api_responser_1.deniedResponse)(res, {}, 'File size exceeds 1MB limit.');
        }
    }
    next();
};
exports.validateFilesSize = validateFilesSize;
