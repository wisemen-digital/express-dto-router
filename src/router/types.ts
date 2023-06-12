import type { NextFunction, Request, Response } from 'express'
import { DTO } from './DTO'

export type Constructor<T> = T extends undefined ? undefined : new () => T

export type MiddlewareHandler = (req: Request, res: Response, next: NextFunction) => void
interface ControllerMetaOptions {
  query?: DTO | undefined
  body?: DTO | undefined
}

export interface ControllerOptions <
  Options extends ControllerMetaOptions = { query: undefined, body: undefined }
> {
  req: Request
  query: Options['query']
  body: Options['body']
  }

export interface RouteOptions <BodyDTO extends DTO | undefined, QueryDTO extends DTO | undefined>  {
  path: string
  middleware?: MiddlewareHandler[]
  controller: (options: ControllerOptions<{ body: BodyDTO, query: QueryDTO }>) => Promise<unknown>
  dtos?: {
    groups?: string[]
    query?: Constructor<QueryDTO>
    body?: Constructor<BodyDTO>
  }
}

export interface HandleOptions <BodyDTO extends DTO | undefined, QueryDTO extends DTO | undefined> {
  req: Request
  res: Response
  controller: (options: ControllerOptions<{ body?: BodyDTO, query?: QueryDTO }>) => Promise<unknown>
  dtos?: {
    groups?: string[]
    query?: Constructor<QueryDTO>
    body?: Constructor<BodyDTO>
  }
}
