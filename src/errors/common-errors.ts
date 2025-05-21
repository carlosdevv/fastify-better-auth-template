import { AppError, type ErrorDetails, ErrorDomain, ErrorType } from './app-error.ts';

export class NotFoundError extends AppError {
  constructor(message: string, domain: ErrorDomain = ErrorDomain.SYSTEM, details?: ErrorDetails) {
    super(message, 404, domain, ErrorType.NOT_FOUND, details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(
    message = 'You need to be logged in to access this resource.',
    domain: ErrorDomain = ErrorDomain.AUTH,
    details?: ErrorDetails,
  ) {
    super(message, 401, domain, ErrorType.UNAUTHORIZED, details);
  }
}

export class ForbiddenError extends AppError {
  constructor(
    message = 'Unauthorized.',
    domain: ErrorDomain = ErrorDomain.AUTH,
    details?: ErrorDetails,
  ) {
    super(message, 403, domain, ErrorType.FORBIDDEN, details);
  }
}

export class ValidationError extends AppError {
  constructor(
    message: string,
    domain: ErrorDomain = ErrorDomain.VALIDATION,
    details?: ErrorDetails,
  ) {
    super(message, 400, domain, ErrorType.VALIDATION, details);
  }
}

export class ConflictError extends AppError {
  constructor(message: string, domain: ErrorDomain = ErrorDomain.SYSTEM, details?: ErrorDetails) {
    super(message, 409, domain, ErrorType.CONFLICT, details);
  }
}

export class BadRequestError extends AppError {
  constructor(message: string, domain: ErrorDomain = ErrorDomain.SYSTEM, details?: ErrorDetails) {
    super(message, 400, domain, ErrorType.BAD_REQUEST, details);
  }
}

export class ExternalServiceError extends AppError {
  constructor(message: string, details?: ErrorDetails) {
    super(message, 502, ErrorDomain.EXTERNAL, ErrorType.EXTERNAL_SERVICE, details);
  }
}

export class InternalServerError extends AppError {
  constructor(
    message = 'Internal server error. Please try again later.',
    domain: ErrorDomain = ErrorDomain.SYSTEM,
    details?: ErrorDetails,
  ) {
    super(message, 500, domain, ErrorType.INTERNAL, details);
  }
}
