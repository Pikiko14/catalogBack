import mongoose, { Schema, model } from "mongoose";
import { VisitsInterface } from "../interfaces/visits.interface";

const VisitsSchema = new Schema<VisitsInterface>(
    {
        city: {
            type: String,
            required: true
        },
        country: {
            type: String,
            required: true
        },
        ip: {
            type: String,
            required: true
        },
        loc: {
            type: String,
            required: true
        },
        org: {
            type: String,
            required: true
        },
        postal: {
            type: String,
            required: true
        },
        region: {
            type: String,
            required: true
        },
        timezone: {
            type: String,
            required: true
        },
        catalogue_id: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: 'catalogues',
        },
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'users'
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

const VisitModel = model('visits', VisitsSchema);
export default VisitModel;
