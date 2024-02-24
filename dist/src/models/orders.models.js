"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const OrdersSchema = new mongoose_1.Schema({
    client: {
        name: {
            type: String,
            nullable: false,
            default: '',
        },
        last_name: {
            type: String,
            nullable: false,
            default: '',
        },
        email: {
            type: String,
            nullable: false,
            default: '',
        },
        phone: {
            type: String,
            nullable: false,
            default: '',
        },
        address: {
            type: String,
            nullable: false,
            default: '',
        },
        city: {
            type: String,
            nullable: false,
            default: '',
        },
        document: {
            type: String,
            nullable: false,
            default: '',
        },
        country: {
            type: String,
            nullable: false,
            default: '',
        },
    },
    total: {
        type: Number,
        nullable: false,
        default: 0,
    },
    tax: {
        type: Number,
        nullable: false,
        default: 0,
    },
    base: {
        type: Number,
        nullable: false,
        default: 0,
    },
    total_tax: {
        type: Number,
        nullable: false,
        default: 0,
    },
    items: [{
            attribute: {
                type: String,
                nullable: false,
                default: '',
            },
            price: {
                type: Number,
                nullable: false,
                default: 0,
            },
            quantity: {
                type: Number,
                nullable: false,
                default: 0,
            },
            reference: {
                type: String,
                nullable: false,
                default: '',
            },
            tax: {
                type: Number,
                nullable: false,
                default: 0,
            },
            total: {
                type: Number,
                nullable: false,
                default: 0,
            },
            base: {
                type: Number,
                nullable: false,
                default: 0,
            },
            total_tax: {
                type: Number,
                nullable: false,
                default: 0,
            },
            product_id: {
                type: mongoose_1.default.Schema.Types.ObjectId,
                ref: 'products',
            },
        }],
    user_id: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'users'
    },
    catalogue_id: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'catalogues'
    },
}, {
    timestamps: true,
    versionKey: false,
});
const OrdersModel = (0, mongoose_1.model)('orders', OrdersSchema);
exports.default = OrdersModel;
