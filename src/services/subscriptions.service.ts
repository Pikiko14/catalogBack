import { Response } from "express";
import { Utils } from "../utils/utils";
import { PlanService } from "./plans.service";
import { User } from "../interfaces/users.interface";
import { HandlerRequest } from "../utils/handler.request";
import SubscriptionsModel from "../models/subscriptions.model";
import { SubscriptionUsabilityService } from "./subscription-usability.service";
import { errorResponse, notFountResponse, successResponse } from "../utils/api.responser";
import { EpaycoConfirmationBodyInterface, SubscriptionsInterface } from './../interfaces/subscriptions.interface';

export class SubscriptionService extends SubscriptionUsabilityService {
    model: any = SubscriptionsModel;
    utils: Utils;
    billingPeriodTime: any;
    handlerRequest: HandlerRequest;
    externalUrl: string;
    params: any;
    epaycoPrivateKey: string | undefined;
    epaycoCustomIdClient: string | undefined;
    planService: PlanService;

    constructor(
    ) {
        super();
        this.params = {};
        this.utils = new Utils();
        this.planService = new PlanService();
        this.externalUrl = 'https://secure.epayco.co';
        this.billingPeriodTime = { Monthly: 30, Yearly: 365 };
        this.epaycoPrivateKey = process.env.EPAYCO_PRIVATE_KEY;
        this.epaycoCustomIdClient = process.env.EPAYCO_ID_CLIENT;
        this.handlerRequest = new HandlerRequest(this.externalUrl, this.params);
    }

    /**
     * Create new subscription
     * @param { Response } res
     * @param { SubscriptionsInterface } body
     * @param { User } user
     * @returns
     */
    createSubscription = async (res: Response, body: SubscriptionsInterface, user: User): Promise<any> => {
        try {
            const oldSubscription: SubscriptionsInterface | null = await this.getLastSubscription(user._id as string);
            body.user_id = user._id as string;
            body.date_start = this.utils.getDate();
            body.date_end = this.utils.sumTimeToDate(body.date_start as Date, 'day', this.billingPeriodTime[body.billing_period]);
            body.expired_at = body.date_start;
            const suscription: SubscriptionsInterface = await this.model.create(body);
            // set usabilities
            await this.generateUsabilities(suscription.id, res, suscription.plan_id, oldSubscription);
            // return data
            return successResponse(res, suscription, 'Subscription created success');
        } catch (error) {
            return errorResponse(res, error, 'Error creating subscription');
        }
    }

    /**
     * Create new subscription
     * @param res
     * @param { string } id
     * @param { User } user
     * @returns
     */
    cancelSubscription = async (res: Response, id: string, user: User): Promise<any> => {
        try {
            const subscription: boolean = await this.disableSubscription(id);
            if (subscription) {
                return successResponse(res, subscription, 'Subscription cancel success');
            }
            return notFountResponse(res, id, 'dont exists any active subscription with this id');
        } catch (error) {
            return errorResponse(res, error, 'Error cancel subscription');
        }
    }

    /**
     * Filter subscriptions by key and value
     * @param { string } key
     * @param { any } value
     * @param { boolean } expired
     * @returns { Promise<SubscriptionsInterface | null> }
     */
    getSubscription = async (
        key: keyof SubscriptionsInterface,
        value: string,
        expired =  false
    ): Promise<SubscriptionsInterface | null> => {
        try {
            const query: any = {
                [key]: value,
                expired_at : null
            }
            if (expired) {
                // Si expired es true, filtra por suscripciones que NO estén en null
                query.expired_at = { $ne: null };
            }
            const subscription: SubscriptionsInterface | null = await this.model.findOne(query);
            return subscription;
        } catch (error) {
            throw error;
        }
    };

    /**
     * Disable subscription
     * @param id
     * @returns { Promise<boolean> }
     */
    disableSubscription = async (id: string): Promise<boolean> => {
        const subscription: SubscriptionsInterface | any = await this.getSubscription('_id', id, false);
        if (subscription) {
            const expiredAt = this.utils.getDate();
            subscription.expired_at = expiredAt;
            await subscription.save();
            return subscription;
        }
        return false;
    }

    /**
     * Get last subscription of user
     * @param userId 
     * @returns { string | null }
     */
    getLastSubscription = async (userId: string): Promise<SubscriptionsInterface | null> =>  {
        const subscription: SubscriptionsInterface = await this.model.findOne({ user_id: userId })
        .sort({ createdAt: -1 }) // Ordena por createdAt en orden descendente
        .exec();
        if (subscription) {
            return subscription;
        }
        return subscription;
    }

    /**
     * epayco response
     * @param { Response } res
     * @param { string } refEpayco
     */
    responseEpayco = async (res: Response, refEpayco: any) => {
        try {
            // get epayco data
            const epaycoData = await this.handlerRequest.doRequest(
                `/validation/v1/reference/${refEpayco}`,
                'get',
                null
            );
            // si la respuesta es correcta
            if (epaycoData?.success) {
                const { data } = epaycoData;
                const subscription = await this.model.findById(data['x_extra1']);
                if (subscription) {
                    let status = true;
                    if (data['x_transaction_state'] === 'Aceptada' && data['x_cod_response'] === 1) {
                        subscription.expired_at = null;
                        await subscription.save();
                    }
                    if (data['x_transaction_state'] === 'Rechazada' || data['x_transaction_state'] === 'Fallida') {
                        await this.deleteUsabilities(subscription.id);
                        await this.model.findOneAndDelete({ _id: subscription.id });
                    }
                    // Redirigir a otra URL
                    return res.redirect(
                        `${process.env.APP_URL}/dashboard/profile?subscription=${subscription.id}&success=${status}&status=${data['x_transaction_state']}`
                    );
                }
                return errorResponse(res, null, `Subscription id ${data['x_extra1']} don't exists`);
            }
            // si obtenemos error
            if (epaycoData?.data && epaycoData?.data.status === 'error') {
                return errorResponse(res, null, epaycoData?.data.description);
            }
        } catch (error) {
            return errorResponse(res, error, 'Error epayco response');
        }
    }

    /**
     * confirmation response epayco
     * @param { Response } res
     * @param { EpaycoConfirmationBodyInterface } body
     */
    confirmationEpayco = async (res: Response, body: EpaycoConfirmationBodyInterface) => {
        try {
            const { x_ref_payco, x_transaction_id, x_amount, x_currency_code, x_signature, x_cod_response, x_id_invoice } = body;
            // get encrypt signature for validate epayco
            const signatureString: string = `${this.epaycoCustomIdClient}^${this.epaycoPrivateKey}^${x_ref_payco}^${x_transaction_id}^${x_amount}^${x_currency_code}`;
            const signature: string |void = await this.utils.doHash(signatureString);
            // procedemos a validar la orden
            if (signature === x_signature) {
                // get subscription id
                const idSubscription = x_id_invoice.split('_').pop();
                const subscription = await this.model.findById(idSubscription);
                if (subscription) {
                    // valdiate order status
                    switch (parseInt(x_cod_response as any)) {
                        case 1:
                            subscription.expired_at = null;
                            await subscription.save();
                            break;

                        case 3:
                            subscription.expired_at = null;
                            await subscription.save();
                            break;
                    
                        default:
                            await this.deleteUsabilities(subscription.id);
                            await this.model.findOneAndDelete({ _id: subscription.id });
                            break;
                    }
                    // return success response
                    return successResponse(res, subscription, 'The subscription status has been validated correctly');
                }
                // return response if no isset idSunscription
                return errorResponse(res, idSubscription, 'The subscription id does not exist in our records');
            }
            // return response if signature validations is invalid
            return errorResponse(res, { signature, x_signature }, 'Validation signatures do not match');
        } catch (error) {
            return errorResponse(res, error, 'Transaction confirmation failed.');
        }
    }

    /**
     * create free subscription
     * @param { User } user
     */
    createFreeSubscription = async (user: User) => {
        try {
            const freePlan = await this.planService.getFreePlan();
            const body: SubscriptionsInterface = {
                plan_id: freePlan._id,
                user_id: user._id as string,
                date_start: this.utils.getDate(),
                date_end: this.utils.sumTimeToDate(this.utils.getDate()as Date, 'day', 15),
                expired_at: null,
                billing_period: 'Monthly'
            };
            const suscription: SubscriptionsInterface = await this.model.create(body);
            // set usabilities
            const oldSubscription: SubscriptionsInterface | null = await this.getLastSubscription(user._id as string);
            await this.generateUsabilitiesForFreePlan(suscription.id, suscription.plan_id);
        } catch (error) {
            throw error;
        }
    }
}