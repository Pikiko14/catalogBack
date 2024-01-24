import * as fs from 'fs';
import { default as pdfParse, Options, Result } from 'pdf-parse';
import { Request, Response } from 'express';
import { RequestExt } from '../interfaces/req-ext';
import { deniedResponse, notFountResponse } from '../utils/api.responser';
import { Utils } from '../utils/utils';
import { CatalogueService } from '../services/catalogues.service';
import { Catalogue } from '../interfaces/catalogues.interface';
import { UserService } from '../services/users.service.';
import { SubscriptionUsabilityInterface } from '../interfaces/SubscriptionUsability.interface';
import { SubscriptionUsabilityService } from '../services/subscription-usability.service';
import { SubscriptionService } from '../services/subscriptions.service';

// instances
const utils: Utils = new Utils();
const userService: UserService = new UserService();
const catalogService: CatalogueService = new CatalogueService();
const subscriptionService: SubscriptionService = new SubscriptionService();
const subscriptionUsabilityService: SubscriptionUsabilityService = new SubscriptionUsabilityService();

export function PagesImportDecorator(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    descriptor.value = async function (req: RequestExt, res: Response): Promise<any> {
        // do some validations
        const file = req.file as any;
        // get catalogue
        const catalog: Catalogue | any = await catalogService.findById(req.body.catalogId) as any;
        if (!catalog) {
            await removeItem(file.filename);
            return notFountResponse(res, req.body.catalogue_id, 'Catalog id don`t exists.');
        }
        const totalPage: number = catalog.pages.length;
        // validamos la subscripcion y la usabilidad
         // get user
        const user: any = await userService.getUserById(catalog.user_id);
        if (!user) {
            await removeItem(file.filename);
            return notFountResponse(res, req.body.user_id, 'User id don`t exists.');
        }
        // obtenemos la subscripcion del cliente
        const subscription= await subscriptionService.getSubscription('user_id', user.id);
        if (!subscription) {
            await removeItem(file.filename);
            return notFountResponse(res, req.body.user_id, 'User don`t have active subscription.');
        }
        // get usabilities
        let path: string = req.baseUrl.split('/api/v1/').pop() as string;
        let method = req.method;
        const existsAbility: SubscriptionUsabilityInterface | any = await subscriptionUsabilityService.hasAbility(subscription.id, path, method);
        if (!existsAbility) {
            await removeItem(file.filename);
            return deniedResponse(
                res,
                {},
                "Your plan does not have access to this functionality."
            );
        }
        // obtenemos el total de paginas del pdf;
        const dataBuffer = fs.readFileSync(file.path);
        const data = await pdfParse(dataBuffer)
        const totalPagesInUse = totalPage + data.numpages;
        if (totalPagesInUse > existsAbility.total) {
            await removeItem(file.filename);
            return deniedResponse(
                res,
                null,
                `Your catalog has a total of ${totalPage} pages, the PDF you are trying to export has a total of ${data.numpages} pages, the sum of the PDF plus the current pages of the catalog exceeds the total pages available for your plan for each catalog.`
            );
            
        }
        // if validator pass call original methods
        await (originalMethod.call(this, req, res) as Promise<void>);
    }
}

async function removeItem (path: string) {
    await utils.deleteItemFromStorage(`pdfs/${path}`);
}
