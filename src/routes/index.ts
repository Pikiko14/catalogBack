import { Router } from "express";
import { readdirSync } from "fs";
import { Utils } from "../utils/utils";

const router = Router();
const PATH_ROUTER = `${__dirname}`;
const utils = new Utils();

readdirSync(PATH_ROUTER).filter(fileName => {
    if (fileName !== "index.ts") {
        const nameFile = utils.splitFile(fileName, '.');
        import(`./${nameFile}`).then((moduleRouter) => {
            console.log(`Loading ${nameFile} routers`);
            router.use(`/api/v1/${nameFile}`, moduleRouter.router);
        });
    }
})

export { router };
