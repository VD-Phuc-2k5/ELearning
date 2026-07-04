import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import type { Request } from 'express';
import type { LoggerService } from '@nestjs/common';
import { AuthFailures } from '../../modules/auth/domain/errors/auth.failures';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: LoggerService) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest<Request>();
    const { method, url } = request;

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const res = exception.getResponse();
      const message =
        typeof res === 'string'
          ? res
          : (res as { message?: string }).message || exception.message;
      this.logger.error(`${method} ${url}`, `${status} ${message}`);
      response.status(status).json({ statusCode: status, message });
      return;
    }

    if (exception instanceof AuthFailures) {
      const status = this.mapFailureCode(exception.code);
      this.logger.error(`${method} ${url}`, `${status} ${exception.message}`);
      response
        .status(status)
        .json({ statusCode: status, message: exception.message });
      return;
    }

    this.logger.error(`${method} ${url} 500`, (exception as Error).stack);

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
    });
  }

  private mapFailureCode(code: string): number {
    switch (code) {
      case 'USER_NOT_FOUND':
      case 'ROLE_NOT_FOUND':
      case 'PERMISSION_NOT_FOUND':
      case 'RESOURCE_NOT_FOUND':
        return HttpStatus.NOT_FOUND;
      case 'USER_ALREADY_EXISTS':
      case 'ROLE_ALREADY_EXISTS':
      case 'PERMISSION_ALREADY_EXISTS':
      case 'ALREADY_ASSIGNED':
      case 'EMAIL_ALREADY_IN_USE':
        return HttpStatus.CONFLICT;
      case 'INVALID_PASSWORD':
      case 'INVALID_REFRESH_TOKEN':
        return HttpStatus.UNAUTHORIZED;
      case 'NOT_ADMIN':
      case 'ADMIN_NOT_ALLOWED':
      case 'SELF_PERMISSION_GRANT':
      case 'CANNOT_MODIFY_OWNER':
      case 'CANNOT_DELETE_SELF':
        return HttpStatus.FORBIDDEN;
      case 'USER_INACTIVE':
        return HttpStatus.FORBIDDEN;
      default:
        return HttpStatus.BAD_REQUEST;
    }
  }
}
