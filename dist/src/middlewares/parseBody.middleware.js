"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const api_responser_1 = require("../utils/api.responser");
// middleare permission
const parseBodyAttributesToJson = (model) => {
    return (req, res, next) => {
        try {
            for (const obj of Object.keys(req.body)) {
                if (req.body[obj].length > 0 && typeof req.body[obj] === 'string' && req.body[obj].substring(0, 1).includes('[') || req.body[obj].substring(0, 1).includes('{')) {
                    const jsonData = JSON.parse(req.body[obj]);
                    if (Array.isArray(jsonData) || typeof jsonData === 'object') {
                        req.body[obj] = jsonData;
                    }
                }
            }
            next();
        }
        catch (error) {
            console.log(error);
            return (0, api_responser_1.deniedResponse)(res, {}, "Error on parsing body to json.");
        }
    };
};
exports.default = parseBodyAttributesToJson;
