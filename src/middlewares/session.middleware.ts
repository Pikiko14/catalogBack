import { Utils } from "../utils/utils";
import { RequestExt } from "../interfaces/req-ext";
import { NextFunction, Request, Response } from "express";
import { noAuthorizedResponse } from "../utils/api.responser";

// instances
const utils = new Utils();

const sessionCheck = async (req: RequestExt, res: Response, next: NextFunction) => {
  try {
    const jwtByUser = req.headers.authorization || "";
    const jwt = jwtByUser.split(" ").pop(); // 11111
    const isUser = await utils.verifyToken(`${jwt}`) as { id: string };
    if (!isUser) {
      return noAuthorizedResponse(res, {}, "Necesitas iniciar sesión para continuar");
    } else {
      req.user = isUser;
      next();
    }
  } catch (e) {
    return noAuthorizedResponse(res, {}, "No has iniciado sesión aun.");
  }
};

export default sessionCheck;