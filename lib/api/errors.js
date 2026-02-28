/**
 * Custom Error Classes for API Error Handling
 */

export class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

export class ValidationError extends ApiError {
  constructor(message, errors) {
    super(message, 422, errors);
    this.name = 'ValidationError';
    this.errors = errors;
  }
}

export class AuthenticationError extends ApiError {
  constructor(message = 'Authentication required') {
    super(message, 401, null);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends ApiError {
  constructor(message = 'You do not have permission to access this resource') {
    super(message, 403, null);
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends ApiError {
  constructor(message = 'Resource not found') {
    super(message, 404, null);
    this.name = 'NotFoundError';
  }
}

export class ServerError extends ApiError {
  constructor(message = 'An internal server error occurred') {
    super(message, 500, null);
    this.name = 'ServerError';
  }
}

/**
 * Error handler utility to parse and format API errors
 */
export const handleApiError = (error) => {
  // If it's already our custom error, return it
  if (error instanceof ApiError) {
    return error;
  }

  // Parse axios/fetch errors
  const status = error.response?.status || error.status;
  const message = error.response?.data?.message || error.message || 'An unexpected error occurred';
  const data = error.response?.data || error.data;

  switch (status) {
    case 400:
      return new ApiError(message, 400, data);
    case 401:
      return new AuthenticationError(message);
    case 403:
      return new AuthorizationError(message);
    case 404:
      return new NotFoundError(message);
    case 422:
      return new ValidationError(message, data?.errors);
    case 500:
    case 502:
    case 503:
      return new ServerError(message);
    default:
      return new ApiError(message, status, data);
  }
};

/**
 * Format validation errors for form display
 */
export const formatValidationErrors = (errors) => {
  if (!errors) return {};

  // If errors is an array of objects with field and message
  if (Array.isArray(errors)) {
    return errors.reduce((acc, error) => {
      acc[error.field] = error.message;
      return acc;
    }, {});
  }

  // If errors is already an object with field keys
  return errors;
};

/**
 * Get user-friendly error message
 */
export const getErrorMessage = (error) => {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  return error?.message || 'An unexpected error occurred. Please try again.';
};
