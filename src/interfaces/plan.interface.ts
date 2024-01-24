import { Document } from "mongoose";
import { TypeCharacteristics } from "../models/plan.model";

export interface PlanInterface extends Document  {
    name: string;
    description: string;
    price_month: number;
    price_year?: number;
    characteristics: CharacteristicsInterface[];
}

export interface CharacteristicsInterface {
    quantity: number;
    description: string;
    methods: string;
    path: string;
    type_characteristics: TypeCharacteristics;
}
