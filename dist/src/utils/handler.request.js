"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HandlerRequest = void 0;
const axios_1 = __importDefault(require("axios"));
class HandlerRequest {
    constructor(url, params) {
        /**
         * handler request
         * @param path
         * @param method
         * @param headers
         * @returns
         */
        this.doRequest = async (path, method, headers) => {
            try {
                const requestConfig = {
                    method: method.toUpperCase(),
                    url: `${this.url}${path}`,
                    headers: headers,
                    data: this.params,
                };
                const response = await (0, axios_1.default)(requestConfig);
                return response.data;
            }
            catch (error) {
                console.error('Error on handling external request: ', error.message);
                return error;
            }
        };
        this.url = url;
        this.params = params;
    }
}
exports.HandlerRequest = HandlerRequest;
