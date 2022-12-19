/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express'
import { validate } from 'class-validator'
import { plainToInstance } from 'class-transformer'
import { CustomError } from '../errors/CustomError'

export abstract class DTO {
  async validate (req: Request, res: Response): Promise<this> {
    const dto = plainToInstance(this.constructor as unknown as any, req.body)

    Object.assign(this, dto)

    const errors = await validate(this, { whitelist: true, forbidNonWhitelisted: true })

    if (errors.length > 0) {
      throw new CustomError(errors)
    }

    return this
  }
}
