export enum ErrorDomain {
  AUTH = 'AUTH',
  USER = 'USER',
  ADMIN = 'ADMIN',
  SYSTEM = 'SYSTEM',
  VALIDATION = 'VALIDATION',
  EXTERNAL = 'EXTERNAL',
}

export enum ErrorType {
  NOT_FOUND = 'NOT_FOUND',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  VALIDATION = 'VALIDATION',
  INTERNAL = 'INTERNAL',
  EXTERNAL_SERVICE = 'EXTERNAL_SERVICE',
  CONFLICT = 'CONFLICT',
  BAD_REQUEST = 'BAD_REQUEST',
}

export interface ErrorDetails {
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  [key: string]: any;
}

export class AppError extends Error {
  /** HTTP status code */
  public statusCode: number;

  /** Unique error code for identification */
  public errorCode: string;

  /** Domain where the error originated */
  public domain: ErrorDomain;

  /** Error type */
  public type: ErrorType;

  /** Additional error details */
  public details?: ErrorDetails;

  /** Date and time when the error occurred */
  public timestamp: Date;

  constructor(
    message: string,
    statusCode: number,
    domain: ErrorDomain,
    type: ErrorType,
    details?: ErrorDetails,
  ) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.domain = domain;
    this.type = type;
    this.details = details;
    this.timestamp = new Date();

    // Creates an error code in the format DOMAIN-TYPE-TIMESTAMP
    // Ex: AUTH-UNAUTHORIZED-20231005123456
    const formattedTimestamp = this.timestamp
      .toISOString()
      .replace(/[-:T.Z]/g, '')
      .substring(0, 14);

    this.errorCode = `${domain}-${type}-${formattedTimestamp}`;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  public toResponse() {
    return {
      error: {
        code: this.errorCode,
        type: this.type,
        domain: this.domain,
        message: this.message,
        timestamp: this.timestamp.toISOString(),
        details: this.details,
      },
    };
  }
}
