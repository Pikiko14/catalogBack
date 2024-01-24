import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

export class HandlerRequest {
    url: string;
    params: any;

    constructor(url: string, params: any) {
        this.url = url;
        this.params = params;
    }

    /**
     * handler request
     * @param path 
     * @param method 
     * @param headers 
     * @returns 
     */
    doRequest = async (path: string, method: string, headers: any): Promise<any> => {
        try {
            const requestConfig: AxiosRequestConfig = {
                method: method.toUpperCase(),
                url: `${this.url}${path}`,
                headers: headers,
                data: this.params,
            };
            const response: AxiosResponse = await axios(requestConfig);
            return response.data;
        } catch (error: any) {
            console.error('Error on handling external request: ', error.message);
            return error;
        }
    }
}