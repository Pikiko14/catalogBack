"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils/utils");
const api_responser_1 = require("../utils/api.responser");
// instances
const utils = new utils_1.Utils();
const sessionCheck = async (req, res, next) => {
    try {
        const jwtByUser = req.headers.authorization || "";
        const jwt = jwtByUser.split(" ").pop(); // 11111
        const isUser = await utils.verifyToken(`${jwt}`);
        if (!isUser) {
            return (0, api_responser_1.noAuthorizedResponse)(res, {}, "Necesitas iniciar sesión para continuar");
        }
        else {
            req.user = isUser;
            next();
        }
    }
    catch (e) {
        return (0, api_responser_1.noAuthorizedResponse)(res, {}, "No has iniciado sesión aun.");
    }
};
exports.default = sessionCheck;
