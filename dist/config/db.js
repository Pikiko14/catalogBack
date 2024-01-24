"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const dbConnect = async () => {
    const DB_URI = process.env.DB_URI;
    await (0, mongoose_1.connect)(DB_URI);
};
exports.default = dbConnect;
