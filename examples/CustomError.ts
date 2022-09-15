import { CustomError as DTOError , defaultErrors } from 'express-dto-router'

const list = {
  ...defaultErrors,
  validation_error: {
    description: 'Validation error',
    status: 400
  },
  not_found: {
    description: 'Not found',
    status: 404
  },
}

type listTypes = keyof typeof list

export class CustomError extends DTOError<listTypes> {
  static errors = list
}

new CustomError('not_found')
