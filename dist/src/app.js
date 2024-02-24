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
// Configurar el middleware CORS
const corsOptions = {
    origin: ['http://localhost:9000', 'https://localhost:9000', 'https://localhost:9001', 'http://localhost:9001'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    optionsSuccessStatus: 204,
};
// app uses
app.use((0, cors_1.default)(corsOptions));
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
