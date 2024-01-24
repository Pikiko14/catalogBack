"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const api_responser_1 = require("../utils/api.responser");
// middleare permission
const perMissionMiddleware = (scope) => {
    return (req, res, next) => {
        try {
            const { scopes } = req.user; // obtenemos los scopes del usuario que hace la peticion.
            if (scopes && scopes.length > 0) {
                if (!scopes.includes(scope)) { // si el usuario no cuenta con el permiso de ver el recurso
                    return (0, api_responser_1.deniedResponse)(res, {}, "Don´t have permission for do this action.");
                }
                next(); // pasa la peticion normal.
            }
            else {
                // El usuario no tiene el permiso, devuelve una respuesta de no autorizado
                return (0, api_responser_1.deniedResponse)(res, {}, "Don´t have permission for do this action.");
            }
        }
        catch (e) {
            return (0, api_responser_1.deniedResponse)(res, {}, "Error on permission valdiations.");
        }
    };
};
exports.default = perMissionMiddleware;
