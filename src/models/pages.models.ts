import { Utils } from "../utils/utils";
import mongoose, { Schema, model } from "mongoose";
import { S3Service } from "../services/aws/s3/s3.service";
import { PagesInterface } from "../interfaces/pages.interface";
import { CatalogueService } from "../services/catalogues.service";

// instances
const utils = new Utils();
const s3Service = new S3Service();

// declare schema
const PagesSchema = new Schema<PagesInterface>(
    {
        number: {
            type: Number,
            nullable: false
        },
        type: {
            type: String,
            enum: ['simple', 'double', 'triple'],
            default: 'simple'
        },
        catalogue_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'catalogues'
        },
        images: [{
            path: {
                type: String,
                default: ''
            },
            order: {
                type: Number,
                default: 1,
            },
            buttons: [{
                x: {
                    type: String,
                },
                y: {
                    type: String,
                    default: ''
                },
                product: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'products'
                }
            }],
        }]
    },
    {
        timestamps: true,
        versionKey: false
    }
);

// MIDDLEWARE ACTIONS //
PagesSchema.pre('findOneAndDelete', { document: true, query: true }, async function (next: any) {
    const page: any = await this.model.findOne(this.getQuery()).exec(); // get page for delete in catalogs
    if (page) {
        try {
            const catalogueService = new CatalogueService();
            await catalogueService.deleteCatalog(page.catalogue_id, page._id);
            if (page.images && page.images.length > 0) {
                for (const image of page.images) {
                    if (image.path && image.path.includes('.s3.us-east-2')) {
                        const key: string = image.path.split('/').pop();
                        await s3Service.deleteSingleObject(key);
                    } else {
                        await utils.deleteItemFromStorage(image.path);
                    }
                }
            }
            next();
        } catch (error) {
            next(error);
        }
    }
});
// FINISH MIDDLEWARE ACTIONS

const PagesModel = model('pages', PagesSchema);

export default PagesModel;