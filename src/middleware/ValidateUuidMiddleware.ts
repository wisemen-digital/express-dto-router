import {RequestParamHandler, Request, Response, NextFunction} from "express";
import {isUUID} from "class-validator";
import {CustomError} from "../errors/CustomError";
import {defaultErrors} from "../errors/defaultErrors";


export const validateUuid: RequestParamHandler = function (
    req: Request,
    res: Response,
    next: NextFunction,
    param: string,
    name: string
) {
    if(isUUID(param)) {
        next()
    } else {
        next(new CustomError('invalid_uuid').setDesc('Invalid uuid in path!'))
    }
}
