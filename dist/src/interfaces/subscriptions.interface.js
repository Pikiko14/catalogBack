"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BillingPeriodTime = exports.BillingPeriod = void 0;
// Define el enum para los períodos de facturación
var BillingPeriod;
(function (BillingPeriod) {
    BillingPeriod["Monthly"] = "Monthly";
    BillingPeriod["Yearly"] = "Yearly";
})(BillingPeriod || (exports.BillingPeriod = BillingPeriod = {}));
var BillingPeriodTime;
(function (BillingPeriodTime) {
    BillingPeriodTime[BillingPeriodTime["Monthly"] = 30] = "Monthly";
    BillingPeriodTime[BillingPeriodTime["Yearly"] = 365] = "Yearly";
})(BillingPeriodTime || (exports.BillingPeriodTime = BillingPeriodTime = {}));
