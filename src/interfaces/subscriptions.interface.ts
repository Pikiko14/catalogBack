import { ObjectId } from "mongoose";

export interface SubscriptionsInterface {
    id?: string;
    _id?: string;
    user_id: ObjectId | string;
    plan_id: ObjectId | string;
    date_start?: Date;
    date_end?: Date;
    expired_at?: Date | null;
    auto_renew?: boolean;
    billing_period: string;
}

// Define el enum para los períodos de facturación
export enum BillingPeriod {
    Monthly = 'Monthly',
    Yearly = 'Yearly',
}

export enum BillingPeriodTime {
    Monthly = 30,
    Yearly = 365,
}

// epayco confirmation body
export interface EpaycoConfirmationBodyInterface {
    x_cust_id_cliente: number
    x_ref_payco: number
    x_id_factura: string
    x_id_invoice: string
    x_description: string
    x_amount: number
    x_amount_country: number
    x_amount_ok: number
    x_tax: number
    x_tax_ico: number
    x_amount_base: number
    x_currency_code: string
    x_bank_name: string
    x_cardnumber: string
    x_quotas: string
    x_respuesta: string
    x_response: string
    x_approval_code: string
    x_transaction_id: string
    x_fecha_transaccion: string
    x_transaction_date: string
    x_cod_respuesta: number
    x_cod_response: number
    x_response_reason_text: string
    x_cod_transaction_state: number
    x_transaction_state: string
    x_errorcode: string
    x_franchise: string
    x_business: string
    x_customer_doctype: string
    x_customer_document: string
    x_customer_name: string
    x_customer_lastname: string
    x_customer_email: string
    x_customer_phone: string
    x_customer_movil: string
    x_customer_ind_pais: string
    x_customer_country: string
    x_customer_city: string
    x_customer_address: string
    x_customer_ip: string
    x_signature: string
    x_test_request: string
    x_transaction_cycle: any
    x_extra1: string
    x_extra2: string
    x_extra3: string
    x_extra4: string
    x_extra5: string
    x_extra6: string
    x_extra7: string
    x_extra8: string
    x_extra9: string
    x_extra10: string
    x_type_payment: string
  }
  
