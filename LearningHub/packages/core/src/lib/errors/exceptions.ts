class AppException extends Error {
  constructor(message: string) {
    super(message);
    this.name = new.target.name;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

class NetworkException extends AppException {
  constructor() {
    super('Please check your internet connection');
  }
}

class AuthenticationException extends AppException {}

class PermissionException extends AppException {}

class NotFoundException extends AppException {}

class UnknownException extends AppException {
  constructor() {
    super('An unknown error occurred.');
  }
}

export interface ApiErrorShape {
  response?: { data?: { message?: string } };
}

function isAxiosErrorLike(e: unknown): e is {
  isAxiosError?: boolean;
  response?: { status?: number; data?: { message?: string } };
  message?: string;
} {
  return typeof e === 'object' && e !== null && 'isAxiosError' in e;
}

function handleAxiosError(e: unknown): never {
  if (isAxiosErrorLike(e)) {
    if (!e.response) throw new NetworkException();
    const status = e.response.status;
    const message: string = e.response.data?.message || e.message || '';
    if (status === 401) throw new AuthenticationException(message);
    if (status === 403) throw new PermissionException(message);
    if (status === 404) throw new NotFoundException(message);
    throw new UnknownException();
  }
  throw new NetworkException();
}

export {
  NetworkException,
  AuthenticationException,
  PermissionException,
  NotFoundException,
  UnknownException,
  handleAxiosError,
};
