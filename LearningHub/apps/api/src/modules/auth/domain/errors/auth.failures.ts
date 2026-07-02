import { Failure } from '@learning-hub/core';

export class AuthFailures extends Failure {
  public code: string;

  constructor(message: string, code: string) {
    super(message);
    this.code = code;
  }

  static userAlreadyExists(): AuthFailures {
    return new AuthFailures('User already exists', 'USER_ALREADY_EXISTS');
  }

  static userNotFound(): AuthFailures {
    return new AuthFailures('User not found', 'USER_NOT_FOUND');
  }

  static invalidPassword(): AuthFailures {
    return new AuthFailures('Invalid password', 'INVALID_PASSWORD');
  }

  static invalidRefreshToken(): AuthFailures {
    return new AuthFailures('Invalid refresh token', 'INVALID_REFRESH_TOKEN');
  }

  static roleAlreadyExists(): AuthFailures {
    return new AuthFailures('Role already exists', 'ROLE_ALREADY_EXISTS');
  }

  static roleNotFound(): AuthFailures {
    return new AuthFailures('Role not found', 'ROLE_NOT_FOUND');
  }

  static permissionAlreadyExists(): AuthFailures {
    return new AuthFailures(
      'Permission already exists',
      'PERMISSION_ALREADY_EXISTS',
    );
  }

  static permissionNotFound(): AuthFailures {
    return new AuthFailures('Permission not found', 'PERMISSION_NOT_FOUND');
  }

  static alreadyAssigned(): AuthFailures {
    return new AuthFailures('Already assigned', 'ALREADY_ASSIGNED');
  }

  static userInactive(): AuthFailures {
    return new AuthFailures('User is inactive', 'USER_INACTIVE');
  }

  static notAdmin(): AuthFailures {
    return new AuthFailures('User does not have admin role', 'NOT_ADMIN');
  }

  static adminNotAllowed(): AuthFailures {
    return new AuthFailures(
      'Admin accounts must use the admin portal',
      'ADMIN_NOT_ALLOWED',
    );
  }

  static selfPermissionGrant(): AuthFailures {
    return new AuthFailures(
      'Cannot grant permission to yourself',
      'SELF_PERMISSION_GRANT',
    );
  }

  static cannotModifyOwner(): AuthFailures {
    return new AuthFailures(
      'Admin cannot modify permissions of an owner',
      'CANNOT_MODIFY_OWNER',
    );
  }

  static resourceNotFound(): AuthFailures {
    return new AuthFailures(
      'Resource not found in registry',
      'RESOURCE_NOT_FOUND',
    );
  }

  static emailAlreadyInUse(): AuthFailures {
    return new AuthFailures('Email already in use', 'EMAIL_ALREADY_IN_USE');
  }

  static cannotDeleteSelf(): AuthFailures {
    return new AuthFailures(
      'Cannot delete your own account',
      'CANNOT_DELETE_SELF',
    );
  }

  static invalidOrUsedResetToken(): AuthFailures {
    return new AuthFailures(
      'Token is invalid or has already been used',
      'INVALID_OR_USED_RESET_TOKEN',
    );
  }

  static resetTokenExpired(): AuthFailures {
    return new AuthFailures('Reset token has expired', 'RESET_TOKEN_EXPIRED');
  }
}
