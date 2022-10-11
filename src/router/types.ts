import type { NextFunction, Request, Response } from 'express'
import type { DTO } from './DTO'

export type RequestHandler<T> = (req: Request, dto?: T) => Promise<unknown>
export type MiddlewareHandler = (req: Request, res: Response, next: NextFunction) => void |
  RequestHandler<unknown>
export type RouterHandler<T extends DTO> = [...MiddlewareHandler[], RequestHandler<undefined>]|
[Constructor<T>, ...MiddlewareHandler[], RequestHandler<T>]

export type Constructor<T> = new () => T


