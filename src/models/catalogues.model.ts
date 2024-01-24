import { Utils } from "../utils/utils";
import mongoose, { Schema, Types, model, Model } from "mongoose";
import { Catalogue } from "../interfaces/catalogues.interface";
import { UserService } from './../services/users.service.';

//intances
const utils = new Utils();
const userService = new UserService();

const CatalogueSchema = new Schema<Catalogue>(
    {
        name: {
            type: String,
            nullable: true,
            default: '',
        },
        start_date: {
            type: Date,
            default: Date.now
        },
        end_date: {
            type: Date,
            default: Date.now
        },
        is_active: {
            type: Boolean,
            default: false
        },
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'users'
        },
        pages: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'pages'
        }],
        cover: {
            type: String,
            nullable: true
        }
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

// MIDDLEWARE ACTIONS// Define un middleware pre para el evento 'remove'
CatalogueSchema.pre('findOneAndDelete', { document: true, query: true }, async function (next: any) {
    const catalog = await this.model.findOne(this.getQuery()).exec(); // Obtiene el catálogo antes de eliminarlo
    try {
        await userService.deleteCatalog(catalog.user_id, catalog._id); // delete catalog from user
        await utils.deleteItemFromStorage(catalog.cover); // delete cover from catalog
        // delete pages
        for (const pageId of catalog.pages) {
            const page = await model('pages').findById(pageId).exec();
            // Elimina los archivos de imágenes de la página
            if (page && page.images) {
                for (const image of page.images) {
                    await utils.deleteItemFromStorage(image);
                }
            }
            // Elimina la página
            await model('pages').findByIdAndDelete(pageId).exec();
        }
        // commit a la base de datos
        next();
    } catch (error) {
        next(error);
    }
});

// FINISH MIDDLEWARE ACTIONS
const CatalogueModel = model('catalogues', CatalogueSchema);

export default CatalogueModel;