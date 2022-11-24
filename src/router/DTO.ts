/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express'
import { validate } from 'class-validator'
import { plainToInstance } from 'class-transformer'
import { CustomError } from '../errors/CustomError'
import { DTORouter } from './DTORouter'

export abstract class DTO {
  validate (req: Request, res: Response, next: (r: this) => void): void {

    const dto = req.method === 'GET'
      ? plainToInstance(this.constructor as any, req.query)
      : plainToInstance(this.constructor as any, req.body)

    Object.assign(this, dto)

    validate(this, { whitelist: true, forbidNonWhitelisted: true })
      .then(errors => {
        if (errors.length > 0) {
          DTORouter.handleError(res, new CustomError(errors))
        } else {
          next(this)
        }
      })
      .catch(e => {
        DTORouter.handleError(res, e)
      })
  }
}
