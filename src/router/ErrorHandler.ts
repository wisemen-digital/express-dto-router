import { NextFunction, Request, Response } from 'express'
import { DTORouter } from './DTORouter'

export function DTOErrorHandler () {
  return (error: Error, req: Request, res: Response, next: NextFunction) => {
    if (!res.headersSent) {
      DTORouter.handleError(error, req, res)
        .catch(err => next(err))
    } else {
      next(error)
    }
  }
}
