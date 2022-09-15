/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express'
import { validate } from 'class-validator'
import { plainToInstance } from 'class-transformer'
import { CustomError } from '../errors/CustomError'

export abstract class DTO {
  validate (req: Request, res: Response, next: (r: this) => void): void {
    const dto = plainToInstance(this.constructor as unknown as any, req.body)

    Object.assign(this, dto)

    validate(this, { whitelist: true, forbidNonWhitelisted: true })
      .then(errors => {
        if (errors.length > 0) {
          const error = new CustomError(errors)

          res.status(error.status ?? 400).json(error.response)
        } else {
          next(this)
        }
      })
      .catch(e => {
        res.status(400).json({ error: e.message })
      })
  }
}
