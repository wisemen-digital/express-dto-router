import { NextFunction, Request, RequestHandler, RequestParamHandler, Response, Router } from 'express'
import { CustomError } from '../errors/CustomError'
import { validateUuid } from '../middleware/ValidateUuidMiddleware'
import { ApiResponse } from './ApiResponse'
import { DTO } from './DTO'
import { HandleOptions, MiddlewareHandler, RouteOptions } from './types'
import { captureException } from '@sentry/node'


export class DTORouter {
  readonly router: Router = Router({ mergeParams: true })

  static mapError (error: Error, req: Request, res: Response): Error {
    return error
  }

  static async handleError (err: Error, req: Request, res: Response): Promise<void> {
    const error = this.mapError(err, req, res)

    if (error instanceof CustomError) {
      res.status(error.status ?? 400).json(error.response)
    } else {
      error['transaction_id'] = captureException(error)

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

  private async handle <BodyDTO extends DTO | undefined, QueryDTO extends DTO | undefined> (options: HandleOptions<BodyDTO, QueryDTO>): Promise<void> {
    const { req, res, dtos } = options

    const BodyDTO = dtos?.body
    const QueryDTO = dtos?.query

    const body = BodyDTO == null ? undefined : await new BodyDTO().validate(req.body, dtos?.groups) as BodyDTO
    const query = QueryDTO == null ? undefined : await new QueryDTO().validate(req.query, dtos?.groups) as QueryDTO

    const result = await options.controller({
      req,
      body,
      query
    })

    if (result instanceof ApiResponse) {
      result.execute(res)
    } else {
      res.json(result)
    }
  }

  get <BodyDTO extends DTO | undefined, QueryDTO extends DTO | undefined> (options: RouteOptions<BodyDTO, QueryDTO>): void {
    const { path, middleware, ...handleOptions } = options

    this.router.get(path, ...middleware ?? [], (req: Request, res: Response, next: NextFunction) => {
      this.handle({
        req,
        res,
        ...handleOptions
      }).catch(err => next(err))
    })
  }

  post <BodyDTO extends DTO | undefined, QueryDTO extends DTO | undefined> (options: RouteOptions<BodyDTO, QueryDTO>): void {
    const { path, middleware, ...handleOptions } = options

    this.router.post(path, ...middleware ?? [], (req: Request, res: Response, next: NextFunction) => {
      this.handle({
        req,
        res,
        ...handleOptions
      }).catch(err => next(err))
    })
  }

  delete <BodyDTO extends DTO | undefined, QueryDTO extends DTO | undefined> (options: RouteOptions<BodyDTO, QueryDTO>): void {
    const { path, middleware, ...handleOptions } = options

    this.router.delete(path, ...middleware ?? [], (req: Request, res: Response, next: NextFunction) => {
      this.handle({
        req,
        res,
        ...handleOptions
      }).catch(err => next(err))
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
