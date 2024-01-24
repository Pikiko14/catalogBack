import { RequestExt } from "../interfaces/req-ext";
import { NextFunction, Request, Response } from "express";
import { deniedResponse } from "../utils/api.responser";

// middleare permission
const parseBodyAttributesToJson = (model: string) => {
    return (req: RequestExt, res: Response, next: NextFunction) => {
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
      } catch (error) {
        console.log(error);
        return deniedResponse(res, {}, "Error on parsing body to json.");
      }
    };
};

export default parseBodyAttributesToJson;