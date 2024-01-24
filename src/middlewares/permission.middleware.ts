import { RequestExt } from "../interfaces/req-ext";
import { NextFunction, Request, Response } from "express";
import { deniedResponse } from "../utils/api.responser";
import { User } from "../interfaces/users.interface";

// middleare permission
const perMissionMiddleware = (scope: string) => {
    return (req: RequestExt, res: Response, next: NextFunction) => {
      try {
        const { scopes } = req.user as User; // obtenemos los scopes del usuario que hace la peticion.
        if (scopes && scopes.length > 0) {
            if (!scopes.includes(scope)) { // si el usuario no cuenta con el permiso de ver el recurso
                return deniedResponse(res, {}, "Don´t have permission for do this action.");
            }
            next(); // pasa la peticion normal.
        } else {
          // El usuario no tiene el permiso, devuelve una respuesta de no autorizado
          return deniedResponse(res, {}, "Don´t have permission for do this action.");
        }
      } catch (e) {
        return deniedResponse(res, {}, "Error on permission valdiations.");
      }
    };
};

export default perMissionMiddleware;