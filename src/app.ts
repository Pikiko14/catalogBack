import "dotenv/config";
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

app.use(cors());
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
