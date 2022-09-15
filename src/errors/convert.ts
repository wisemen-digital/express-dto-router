import { ValidationError } from 'class-validator'
import { ConvertedValidationError } from './types'

export function convertValidationError (errors: ValidationError[], path = '$'): ConvertedValidationError[] {
  const convertedErrors: ConvertedValidationError[] = []

  for (const error of errors) {
    const isArray = Array.isArray(error.target)

    const jsonpath = path + (isArray ? `[${error.property}]` : `.${error.property}`)

    if (error.children === undefined || error.children.length === 0) {
      if (error.constraints !== undefined) {
        convertedErrors.push({
          path: jsonpath,
          error: 'validation_error',
          error_description: Object.values(error.constraints)[0]
        })
      }
    } else {
      convertedErrors.push(...convertValidationError(error.children, jsonpath))
    }
  }

  return convertedErrors
}
