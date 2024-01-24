"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const routes_1 = require("./routes");
const db_1 = __importDefault(require("../config/db"));
const path_1 = __importDefault(require("path"));
// public path
const publicDirectoryPath = path_1.default.join(__dirname, '../uploads');
// app declarations
const PORT = process.env.PORT || 3001;
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(routes_1.router);
app.use(express_1.default.static(publicDirectoryPath));
// configure db
const startServer = async () => {
    try {
        await (0, db_1.default)();
        console.log("Base de datos cargada correctamente.");
        // listen app
        app.listen(PORT, () => console.log(`Running on port ${PORT}`));
    }
    catch (error) {
        console.error("Error connecting to the database:", error);
    }
};
startServer();
