import { CategoryInterface } from "./categories.interface";

export interface ProductInterface {
    id?: string;
    tax: number;
    _id?: string;
    name: string;
    user_id?: string;
    reference: string;
    description: string;
    prices: PricesInterface[];
    count_add_to_cart?: number;
    count_order_finish?: number;
    ratings?: RatingsInterface[];
    unit_of_measurement?: string;
    variants?: VariantsInterface[];
    medias?: MediaProductInterface[];
    categories: CategoryInterface[];
    default_image?: MediaProductInterface; 
}

export interface PricesInterface {
    id?: string;
    _id?: string;
    value: number;
    position: number;
    status: ['active', 'inactive'];
}

export interface MediaProductInterface {
    id?: string;
    _id?: string;
    path: string;
    type: TypeMediaEnum;
    provider: ProviderMediaEnum;
    deleted?: boolean;
}

export interface VariantsInterface {
    id?: string;
    tax: number;
    _id?: string;
    reference: string;
    attribute: string;
    prices: PricesInterface[];
    medias?: MediaProductInterface[];
}

export interface RatingsInterface {
    rating: number;
    comment: string;
    name_client: string;
}

export enum StatusPrice {
    active = "active",
    inactive = "inactive"
}

export enum TypeMediaEnum {
    video = 'video',
    image = 'image',
}

export enum ProviderMediaEnum {
    owner = 'owner',
    youtube = 'youtube',
}
