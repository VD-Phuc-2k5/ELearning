import { Failure } from "@learning-hub/core";

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
}