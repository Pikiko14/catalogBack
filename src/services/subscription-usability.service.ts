import { Response } from "express";
import SubscriptionUsabilityModel from "../models/subscription-usability.model";
import { errorResponse } from "../utils/api.responser";
import { Utils } from "../utils/utils";
import { ObjectId } from "mongoose";
import { PlanService } from "./plans.service";
import { PlanInterface } from "../interfaces/plan.interface";
import { SubscriptionUsabilityInterface } from "../interfaces/SubscriptionUsability.interface";
import { SubscriptionsInterface } from "../interfaces/subscriptions.interface";

export class SubscriptionUsabilityService {
    modelUsability: any = SubscriptionUsabilityModel;
    utils: Utils;
    planService: PlanService;

    constructor() {
        this.utils = new Utils();
        this.planService = new PlanService();
    }

    /**
     * generate usabilities for subscription
     * @param { string } id
     * @param { Response } res
     * @param { string } planId
     */
    generateUsabilities = async (id: string | undefined | any, res: Response, planId: string | ObjectId | any, oldSubscription: SubscriptionsInterface | null) => {
        try {
            const plan: PlanInterface = await this.planService.getPlan('_id', planId) as PlanInterface;
            const { characteristics } = plan;
            let subscriptionUsabilities: any[] = []
            if (oldSubscription) {
                subscriptionUsabilities = await this.modelUsability.find({
                    subscription_id: oldSubscription.id,
                })
                .select('path used') // Indica los campos que deseas obtener
                .exec();
            }
            for (const characteristic of characteristics) {
                let quantity = 0;
                if (!characteristic.path.includes('pages') && subscriptionUsabilities.length > 0) {
                    const usabilityPreview = subscriptionUsabilities.find((item: any) => item.path === characteristic.path);
                    quantity = usabilityPreview ? usabilityPreview.used : 0;
                };
                const data: SubscriptionUsabilityInterface = {
                    method: characteristic.methods,
                    path: characteristic.path,
                    total: characteristic.quantity,
                    used: characteristic.type_characteristics === 'boolean' && characteristic.quantity > 0 ?
                        1 :
                        quantity,
                    subscription_id: id,
                    type_characteristics: characteristic.type_characteristics
                }
                await this.modelUsability.create(data);
            }
        } catch (error) {
            return errorResponse(res, error, 'Error generating usabilities ');
        }
    }

    /**
     * validate hasAbility
     * @param subscriptionId
     * @param path
     * @param method
     * @returns
     */
    hasAbility = async(subscriptionId: string | undefined, path: string, method: string): Promise<SubscriptionUsabilityInterface | boolean> => {
        const ability = await this.modelUsability.findOne({
            subscription_id: subscriptionId,
            path: path,
            method: method,
        })
        if (ability) {
            return ability;
        }
        return false
    }

    /**
     * Validamos los usos de las caracteristicas
     * @param res 
     * @param usabilityId 
     * @param actuallyUsed 
     * @returns 
     */
    validateUsed = async (res: Response, usabilityId: string | any, actuallyUsed: number): Promise<void> => {
        try {
            const usability = await this.modelUsability.findOneAndUpdate(
                {
                    _id: usabilityId
                },
                {
                    used: actuallyUsed
                },
                {
                    new: true,
                }
            );
            return usability;
        } catch (error) {
            return errorResponse(res, error, 'Error updating usability ');
        }
    }

    /**
     * delete usabilities
     * @param { string } subscriptionId
     */
    deleteUsabilities = async (subscriptionId: string) => {
        const usabilites = await this.modelUsability.deleteMany({ subscription_id: subscriptionId });
    }
}