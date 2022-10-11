import type { NextFunction, Request, RequestHandler, Response } from 'express'
import type { DTO } from './DTO'

export type CustomRequestHandler<T> = (req: Request, dto?: T) => Promise<unknown>
export type MiddlewareHandler = (req: Request, res: Response, next: NextFunction) => void
export type RouterHandler<T extends DTO> = [...MiddlewareHandler[], CustomRequestHandler<undefined>]|
[Constructor<T>, ...MiddlewareHandler[], CustomRequestHandler<T>]

export type Constructor<T> = new () => T


