export abstract class Failure {
  private _message: string;
  constructor(message: string) {
    this._message = message;
  }

  public get message() {
    return this._message;
  }
}

class NetworkFailure extends Failure {
  constructor() {
    super('Please check your connection.');
  }
}

class AuthenticationFailure extends Failure { }

class PermissionFailure extends Failure {
  constructor() {
    super('You do not have permission for the request.');
  }
}

class NotFoundFailure extends Failure {
  constructor() {
    super('The data requested not found');
  }
}

class UnknownFailure extends Failure {
  constructor() {
    super('An unknown error has occurred. Please try again later.');
  }
}

export {
  NetworkFailure,
  AuthenticationFailure,
  PermissionFailure,
  NotFoundFailure,
  UnknownFailure,
};
