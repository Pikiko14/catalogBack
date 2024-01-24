import { JwtPayload } from "jsonwebtoken";
import { Request } from "express";
import { User } from "./users.interface";
import { SubscriptionUsabilityInterface } from "./SubscriptionUsability.interface";

export interface RequestExt extends Request {
  user?: JwtPayload | { id: string, scopes: string[] } | User | any;
  ability?: SubscriptionUsabilityInterface | any;
}