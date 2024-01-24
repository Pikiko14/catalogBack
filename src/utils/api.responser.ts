import { Response } from "express"

/**
 * Success response
 * @param {*} res 
 * @param {*} data 
 * @param {*} message
 */
const successResponse = (res: Response, data: any, message: string) => {
    res.status(200).json({
        success: true,
        data,
        message
    })
}

/**
 * Create response
 * @param {*} res 
 * @param {*} data 
 * @param {*} message
 */
const createdResponse = (res: Response, data: any, message: string) => {
    res.status(201).json({
        success: true,
        data,
        message
    })
}

/**
 * Error response
 * @param {*} res 
 * @param {*} data 
 * @param {*} message
 */
const errorResponse = (res: Response, data: any, message: string) => {
    res.status(500).json({
        error: true,
        data,
        message
    })
}

/**
 * 404 response
 * @param {*} res 
 * @param {*} data 
 * @param {*} message
 */
const notFountResponse = (res: Response, data: any, message: string) => {
    res.status(404).json({
        error: true,
        data,
        message
    })
}

/**
 * 404 response
 * @param {*} res 
 * @param {*} data 
 * @param {*} message
 */
const unProcesableEntityResponse = (res: Response, data: any, message: string) => {
    res.status(422).json({
        error: true,
        data,
        message
    })
}

/**
 * 401 response
 * @param {*} res 
 * @param {*} data 
 * @param {*} message
 */
const noAuthorizedResponse = (res: Response, data: any, message: string) => {
    res.status(401).json({
        error: true,
        data,
        message
    })
}

/**
 * 403 response
 * @param {*} res 
 * @param {*} data 
 * @param {*} message
 */
const deniedResponse = (res: Response, data: any, message: string) => {
    res.status(403).json({
        error: true,
        data,
        message
    })
}


export {
    successResponse,
    createdResponse,
    errorResponse,
    notFountResponse,
    unProcesableEntityResponse,
    noAuthorizedResponse,
    deniedResponse,
};
