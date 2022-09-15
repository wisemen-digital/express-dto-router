export interface ConvertedValidationError {
  path: string
  error: string
  error_description: string
}

export interface ErrorResponse {
  error: string
  error_description: string
  error_validation?: ConvertedValidationError[]
  error_id?: string
}

export interface ErrorList {
  [key: string]: {
    description: string
    status: number
  }
}
