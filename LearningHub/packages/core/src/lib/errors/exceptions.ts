class AppException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AppException';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

class NetworkException extends AppException {
  constructor() {
    super('Please check your internet connection');
  }
}

class AuthenticationException extends AppException { }

class PermissionException extends AppException { }

class NotFoundException extends AppException { }

class UnknownException extends AppException {
  constructor() {
    super('An unknown error occurred.');
  }
}

export {
  NetworkException,
  AuthenticationException,
  PermissionException,
  NotFoundException,
  UnknownException,
};
