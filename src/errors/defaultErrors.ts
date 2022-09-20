export const defaultErrors = {
  validation_error: {
    status: 400,
    description: 'Validation error'
  },
  invalid_uuid: {
    description: 'The uuid provided is not a valid uuid',
    status: 400
  },
  missing_parameters: {
    description: 'Missing parameters for required field',
    status: 400
  },
  invalid_data: {
    description: 'Invalid data provided',
    status: 400
  },
  email_exists: {
    description: 'The email provided already exists',
    status: 409
  },
  invalid_token: {
    description: 'The token provided is not valid',
    status: 401
  },
  invalid_credentials: {
    description: 'The credentials provided are invalid',
    status: 401
  },
  not_found: {
    description: 'The resource could not be found',
    status: 404
  },
  missing_scope: {
    description: 'The scope provided is missing or invalid',
    status: 403
  },
  unauthorized: {
    description: 'The user is not authorized to perform this action',
    status: 403
  },
  invalid_parameters: {
    description: 'The parameters provided are invalid',
    status: 400
  },
  email_error: {
    description: 'There was an error sending the email',
    status: 500
  },
  already_exists: {
    description: 'Entity already exists',
    status: 409
  },
  invalid_geometric: {
    description: 'Geometric object is invalid',
    status: 400
  },
  invalid_sizing: {
    description: 'Unable to calculate dimensions',
    status: 400
  }
}
