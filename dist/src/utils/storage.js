"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = void 0;
const path_1 = __importDefault(require("path"));
const multer_1 = __importDefault(require("multer"));
const utils_1 = require("./utils");
const utils = new utils_1.Utils();
const dirpath = process.cwd();
const storage = multer_1.default.diskStorage({
    destination: async function (req, file, cb) {
        let path = req.originalUrl ? await utils.getPath(req.originalUrl) : await utils.getPath(req.baseUrl);
        cb(null, `${dirpath}/uploads/${path}`);
    },
    filename: function (req, file, cb) {
        const numberRandom = Math.floor(Math.random() * 100000000000) + 1;
        cb(null, `${file.fieldname}-${Date.now()}-${numberRandom}${path_1.default.extname(file.originalname)}`);
    }
});
exports.upload = (0, multer_1.default)({ storage: storage });
