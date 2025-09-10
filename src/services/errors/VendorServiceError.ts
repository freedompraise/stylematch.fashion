export class VendorServiceError extends Error {
  code: string;
  constructor(message: string, code = 'VENDOR_SERVICE_ERROR') {
    super(message);
    this.name = 'VendorServiceError';
    this.code = code;
  }
}

export class NotFoundError extends VendorServiceError {
  constructor(message = 'Resource not found') {
    super(message, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

export class ValidationError extends VendorServiceError {
  constructor(message = 'Validation failed') {
    super(message, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
}

export class DatabaseError extends VendorServiceError {
  constructor(message = 'Database error') {
    super(message, 'DATABASE_ERROR');
    this.name = 'DatabaseError';
  }
}

export class ProductDeletionError extends VendorServiceError {
  constructor(message: string, originalError?: any) {
    super(message, 'PRODUCT_DELETION_ERROR');
    this.name = 'ProductDeletionError';
  }
} 