import mongoose from "mongoose";
import { LoginInterface } from "./auth.interface";

export interface User extends LoginInterface {
    _id?: string;
    id?: string;
    name: string | undefined;
    last_name: string | undefined;
    email: string;
    role?: string;
    scopes?: string[];
    parent?: string;
    catalogues?: mongoose.Schema.Types.ObjectId[];
    recovery_token?: string;
}