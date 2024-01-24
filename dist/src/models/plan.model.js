"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TypeCharacteristics = void 0;
const mongoose_1 = require("mongoose");
var TypeCharacteristics;
(function (TypeCharacteristics) {
    TypeCharacteristics["QUANTITY"] = "quantity";
    TypeCharacteristics["BOOLEAN"] = "boolean";
})(TypeCharacteristics || (exports.TypeCharacteristics = TypeCharacteristics = {}));
const PlanSchema = new mongoose_1.Schema({
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
}, {
    timestamps: true,
    versionKey: false
});
const PlanModel = (0, mongoose_1.model)('plans', PlanSchema);
exports.default = PlanModel;
