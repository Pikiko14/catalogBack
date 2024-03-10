import dotenv from 'dotenv';
dotenv.config();
import express from "express";
import cors from "cors";
import { router } from "./routes";
import db from "../config/db";
import path from 'path';

// public path
const publicDirectoryPath = path.join(__dirname, '../uploads');

// app declarations
const PORT = process.env.PORT || 3001;
const app = express();


// Configurar el middleware CORS
const corsOptions = {
  origin: [
    'http://localhost:9000',
    'https://localhost:9000',
    'https://localhost:9001',
    'http://localhost:9001',
    'http://onex.host',
    'http://catalogo.onex.host',
    'http://admin.onex.host'
  ],
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  optionsSuccessStatus: 204,
};

// app uses
app.use(cors(corsOptions));
app.use(express.json());
app.use(router);
app.use(express.static(publicDirectoryPath));

// configure db
const startServer = async () => {
  try {
    await db();
    console.log("Base de datos cargada correctamente.");
    // listen app
    app.listen(PORT, () => console.log(`Running on port ${PORT}`));
  } catch (error) {
    console.error("Error connecting to the database:", error);
  }
};

startServer();
