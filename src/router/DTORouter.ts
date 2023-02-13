/* eslint-disable max-len */

import { NextFunction, Request, RequestHandler, RequestParamHandler, Response, Router } from 'express'
import { DTO } from './DTO'
import { CustomError } from '../errors/CustomError'
import { Constructor, MiddlewareHandler, CustomRequestHandler, RouterHandler } from './types'
import { randomUUID } from 'crypto'
import {validateUuid} from "../middleware/ValidateUuidMiddleware";

export interface RouteOptionsDto <T extends DTO> {
  path: string
  dto: Constructor<T>
  controller: (req: Request, dto: T) => Promise<unknown>
  groups?: string[]
  middleware?: MiddlewareHandler[]
}

export interface RouteOptions {
  path: string
  controller: (req: Request) => Promise<unknown>
  middleware?: MiddlewareHandler[]
}

export class ApiResponse {
  constructor (
    private fn: (res: Response) => void
  ) {}

  public execute (res: Response): void {
    this.fn(res)
  }
}

export class DTORouter {
  readonly router: Router = Router({ mergeParams: true })

  static mapError (error: Error): Error {
    return error
  }

  static async handleError (res: Response, err: Error): Promise<void> {
    const error = this.mapError(err)

    if (error instanceof CustomError) {
      res.status(error.status ?? 400).json(error.response)
    } else {
      error['transaction_id'] = randomUUID()

      const status = error['status'] ?? 500

      res.status(status).json({
        errors: [{
          id: error['transaction_id'],
          code: error.name,
          detail: error.message
        }]
      })

      return Promise.reject(error)
    }
  }

  private async handle <T extends DTO> (
    req: Request,
    res: Response,
    handler: CustomRequestHandler<T>,
    DTOClass?: Constructor<T>,
    groups?: string[]
  ): Promise<void> {
    const dto = DTOClass != null ? await new DTOClass().validate(req, res, groups) : undefined

    const result = await handler(req, dto)

    if (result instanceof ApiResponse) {
      result.execute(res)
    } else {
      res.json(result)
    }
  }

  private prepare <T extends DTO> (handlers: RouterHandler<T>): {
    DTOClass?: Constructor<T>
    middleware: MiddlewareHandler[]
    handler: CustomRequestHandler<T>
  } {
    const handler = handlers.pop() as CustomRequestHandler<T>
    const middleware = handlers as [Constructor<DTO>, ...MiddlewareHandler[]]|[...MiddlewareHandler[]]

    let DTOClass: Constructor<T>|undefined

    if (middleware[0]?.prototype instanceof DTO) {
      DTOClass = middleware.shift() as Constructor<T>
    }

    return {
      DTOClass: DTOClass,
      middleware: middleware as MiddlewareHandler[],
      handler
    }
  }

  get <T extends DTO> (path: string, ...handlers: RouterHandler<T>): void {
    const { DTOClass, middleware, handler } = this.prepare(handlers)

    this.router.get(path, ...middleware, (req: Request, res: Response, next: NextFunction) => {
      this.handle(req, res, handler, DTOClass)
        .catch(err => next(err))
    })
  }

  post <T extends DTO> (path: string, ...handlers: RouterHandler<T>): void {
    const { DTOClass, middleware, handler } = this.prepare(handlers)

    this.router.post(path, ...middleware, (req: Request, res: Response, next: NextFunction) => {
      this.handle(req, res, handler, DTOClass)
        .catch(err => next(err))
    })
  }

  delete <T extends DTO> (path: string, ...handlers: RouterHandler<T>): void {
    const { DTOClass, middleware, handler } = this.prepare(handlers)

    this.router.delete(path, ...middleware, (req: Request, res: Response, next: NextFunction) => {
      this.handle(req, res, handler, DTOClass)
        .catch(err => next(err))
    })
  }

  private desctructure <T extends DTO> (options: RouteOptionsDto<T>|RouteOptions) {
    return {
      dto: undefined,
      groups: undefined,
      middleware: [],
      ...options
    }
  }

  get2 <T extends DTO> (options: RouteOptionsDto<T>|RouteOptions): void {
    const { path, dto, groups, middleware, controller } = this.desctructure(options)

    this.router.get(path, ...middleware, (req: Request, res: Response, next: NextFunction) => {
      this.handle(req, res, controller, dto, groups)
        .catch(err => next(err))
    })
  }

  post2 <T extends DTO> (options: RouteOptionsDto<T>|RouteOptions): void {
    const { path, dto, groups, middleware, controller } = this.desctructure(options)

    this.router.post(path, ...(middleware ?? []), (req: Request, res: Response, next: NextFunction) => {
      this.handle(req, res, controller, dto, groups)
        .catch(err => next(err))
    })
  }


  delete2 <T extends DTO> (options: RouteOptionsDto<T>|RouteOptions): void {
    const { path, dto, groups, middleware, controller } = this.desctructure(options)

    this.router.delete(path, ...(middleware ?? []), (req: Request, res: Response, next: NextFunction) => {
      this.handle(req, res, controller, dto, groups)
        .catch(err => next(err))
    })
  }

  use (...handlers: MiddlewareHandler[]|[string, ...Array<RequestHandler|RequestHandler[]>]|[string, ...MiddlewareHandler[]]): void {
    const [path, ...middleware] = handlers as [string, ...MiddlewareHandler[]]

    this.router.use(path, ...middleware)
  }

  param (name: string, handler: RequestParamHandler): void {
    this.router.param(name, (req, res, next, param, name) => {
      handler(req, res, next, param, name)
        ?.catch?.(error => next(error))
    })
  }

  uuidParam(name: string): void {
    this.param(name, validateUuid)
  }
}

export function DTOErrorHandler () {
  return (error: Error, req: Request, res: Response, next: NextFunction) => {
    if (!res.headersSent) {
      DTORouter.handleError(res, error)
        .catch(err => next(err))
    } else {
      next(error)
    }
  }
}
