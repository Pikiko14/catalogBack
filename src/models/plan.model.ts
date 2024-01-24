import mongoose, { Schema, model } from "mongoose";
import { PlanInterface } from "../interfaces/plan.interface";

export enum TypeCharacteristics {
    QUANTITY = 'quantity',
    BOOLEAN = 'boolean'
}

const PlanSchema = new Schema<PlanInterface>(
    {
        name: {
            type: String,
            nullable: false
        },
        description: String,
        price_month: {
            type: Number,
            default: 0,
            nullable: false
        },
        price_year: {
            type: Number,
            default: 0,
            nullable: false
        },
        characteristics: {
            type: [
                {
                    quantity: {
                        type: Number,
                        default: 0,
                    },
                    description: {
                        type: String,
                        nullable: false,
                        default: '',
                    },
                    methods: {
                        type: String,
                        nullable: false,
                        default: 'POST',
                    },
                    path: {
                        type: String,
                        nullable: false,
                        default: '',
                    },
                    type_characteristics: {
                        type: String,
                        enum: Object.values(TypeCharacteristics),
                        nullable: false,
                        default: TypeCharacteristics.QUANTITY
                    }
                }
            ],
            default: []
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

const PlanModel = model('plans', PlanSchema);
export default PlanModel;
