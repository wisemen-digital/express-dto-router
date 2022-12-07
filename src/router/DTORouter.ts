/* eslint-disable max-len */

import { NextFunction, Request, RequestHandler, RequestParamHandler, Response, Router } from 'express'
import { DTO } from './DTO'
import { CustomError } from '../errors/CustomError'
import { Constructor, MiddlewareHandler, CustomRequestHandler, RouterHandler } from './types'
import { randomUUID } from 'crypto'

export class DTORouter {
  readonly router: Router = Router({ mergeParams: true })

  static mapError (error: Error): Error {
    return error
  }

  static async handleError (res: Response, error: Error): Promise<void> {
    if (error instanceof CustomError) {
      res.status(error.status ?? 400).json(error.response)
    } else {
      error['transaction_id'] = randomUUID()

      res.status(500).json({
        errors: [{
          id: error['transaction_id'],
          code: error.name,
          detail: error.message
        }]
      })

      return Promise.reject(error)
    }
  }

  private handle <T extends DTO> (
    req: Request,
    res: Response,
    handler: CustomRequestHandler<T>,
    DTOClass?: Constructor<T>
  ): void {
    const helper = (dto?: T): void => {
      handler(req, dto)
        .then(result => {
          res.json(result)
        })
        .catch(error => {
          void DTORouter.handleError(res, DTORouter.mapError(error))
        })
    }

    if (DTOClass !== null && DTOClass !== undefined) {
      new DTOClass().validate(req, res, dto => helper(dto))
    } else {
      helper()
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

    this.router.get(path, ...middleware, (req: Request, res: Response) => {
      this.handle(req, res, handler, DTOClass)
    })
  }

  post <T extends DTO> (path: string, ...handlers: RouterHandler<T>): void {
    const { DTOClass, middleware, handler } = this.prepare(handlers)

    this.router.post(path, ...middleware, (req: Request, res: Response) => {
      this.handle(req, res, handler, DTOClass)
    })
  }

  delete <T extends DTO> (path: string, ...handlers: RouterHandler<T>): void {
    const { DTOClass, middleware, handler } = this.prepare(handlers)

    this.router.delete(path, ...middleware, (req: Request, res: Response) => {
      this.handle(req, res, handler, DTOClass)
    })
  }

  use (...handlers: MiddlewareHandler[]|[string, ...Array<RequestHandler|RequestHandler[]>]|[string, ...MiddlewareHandler[]]): void {
    const [path, ...middleware] = handlers as [string, ...MiddlewareHandler[]]

    this.router.use(path, ...middleware)
  }

  param (name: string, handler: RequestParamHandler): void {
    this.router.param(name, (req, res, next, param, name) => {
      handler(req, res, next, param, name)
        .catch(error => {
          DTORouter.handleError(res, error)
            .catch(err => next(err))
        })
    })
  }
}

export function DTOErrorHandler () {
  return (error: Error, req: Request, res: Response, next: NextFunction) => {
    if (!res.headersSent) {
      DTORouter.handleError(res, error)
        .catch(err => next(err))
    } else {
      next()
    }
  }
}
