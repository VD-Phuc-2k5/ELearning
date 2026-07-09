/* eslint-disable @typescript-eslint/no-explicit-any */
import 'reflect-metadata';
import { Test, TestingModule } from '@nestjs/testing';
import {
  ConflictException,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthController } from './auth.controller';
import { RegisterUseCase } from '../../application/use-cases/register.use-case';
import { LoginUseCase } from '../../application/use-cases/login.use-case';
import { AdminRegisterUseCase } from '../../application/use-cases/admin-register.use-case';
import { RefreshTokenUseCase } from '../../application/use-cases/refresh-token.use-case';
import { LogoutUseCase } from '../../application/use-cases/logout.use-case';
import { AuthFailures } from '../../domain/errors/auth.failures';

const mockUser = {
  id: 'user-1',
  email: 'test@gmail.com',
  username: 'testuser',
  avatarUrl: '',
  isActive: true,
  createdAt: new Date(),
};

// ponytail: cast to any to avoid importing generic Either types in tests
const right = (value: unknown): any => ({ type: 'right', value });
const left = (value: unknown): any => ({ type: 'left', value });
const mockRes = () => ({ cookie: jest.fn(), clearCookie: jest.fn() });
const mockReq = (cookie = '') => ({ headers: { cookie } });

describe('AuthController', () => {
  let controller: AuthController;
  let registerUseCase: jest.Mocked<RegisterUseCase>;
  let loginUseCase: jest.Mocked<LoginUseCase>;
  let refreshUseCase: jest.Mocked<RefreshTokenUseCase>;
  let logoutUseCase: jest.Mocked<LogoutUseCase>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: RegisterUseCase, useValue: { execute: jest.fn() } },
        { provide: LoginUseCase, useValue: { execute: jest.fn() } },
        { provide: AdminRegisterUseCase, useValue: { execute: jest.fn() } },
        { provide: RefreshTokenUseCase, useValue: { execute: jest.fn() } },
        { provide: LogoutUseCase, useValue: { execute: jest.fn() } },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    registerUseCase = module.get(RegisterUseCase);
    loginUseCase = module.get(LoginUseCase);
    refreshUseCase = module.get(RefreshTokenUseCase);
    logoutUseCase = module.get(LogoutUseCase);
  });

  describe('POST /auth/register', () => {
    it('TC001 — should return user object on successful registration', async () => {
      registerUseCase.execute.mockResolvedValue(right({ user: mockUser }));

      const result = await controller.register({
        email: 'test@gmail.com',
        password: 'Pass@1234',
        username: 'testuser',
      });

      expect(result.user).toMatchObject({
        email: 'test@gmail.com',
        username: 'testuser',
      });
    });

    it('TC003 — should throw ConflictException when email already exists', async () => {
      registerUseCase.execute.mockResolvedValue(
        left(AuthFailures.userAlreadyExists()),
      );

      await expect(
        controller.register({
          email: 'existing@gmail.com',
          password: 'Pass@1234',
          username: 'other',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('TC004 — should throw ConflictException when username already exists', async () => {
      registerUseCase.execute.mockResolvedValue(
        left(AuthFailures.usernameAlreadyExists()),
      );

      await expect(
        controller.register({
          email: 'new@gmail.com',
          password: 'Pass@1234',
          username: 'existinguser',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('POST /auth/login', () => {
    it('TC014 — should set cookies and return tokens on valid login', async () => {
      const res = mockRes();
      const tokens = {
        accessToken: 'access',
        refreshToken: 'refresh',
        user: mockUser,
      };
      loginUseCase.execute.mockResolvedValue(right(tokens));

      const result = await controller.login(
        { email: 'test@gmail.com', password: 'Pass@1234' },
        res as any,
      );

      expect(res.cookie).toHaveBeenCalledWith(
        'accessToken',
        'access',
        expect.any(Object),
      );
      expect(res.cookie).toHaveBeenCalledWith(
        'refreshToken',
        'refresh',
        expect.any(Object),
      );
      expect(result).toEqual(tokens);
    });

    it('TC015 — should throw UnauthorizedException when user not found', async () => {
      loginUseCase.execute.mockResolvedValue(left(AuthFailures.userNotFound()));

      await expect(
        controller.login(
          { email: 'notexist@gmail.com', password: 'Pass@1234' },
          mockRes() as any,
        ),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('TC016 — should throw UnauthorizedException when password is wrong', async () => {
      loginUseCase.execute.mockResolvedValue(
        left(AuthFailures.invalidPassword()),
      );

      await expect(
        controller.login(
          { email: 'test@gmail.com', password: 'Wrong@Pass1' },
          mockRes() as any,
        ),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('TC017 — should throw ForbiddenException when admin account uses /auth/login', async () => {
      loginUseCase.execute.mockResolvedValue(
        left(AuthFailures.adminNotAllowed()),
      );

      await expect(
        controller.login(
          { email: 'admin@gmail.com', password: 'Pass@1234' },
          mockRes() as any,
        ),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('POST /auth/admin/login', () => {
    it('TC018 — should set cookies on valid admin login', async () => {
      const res = mockRes();
      loginUseCase.execute.mockResolvedValue(
        right({ accessToken: 'admin-access', refreshToken: 'admin-refresh' }),
      );

      await controller.adminLogin(
        { email: 'admin@gmail.com', password: 'Pass@1234' },
        res as any,
      );

      expect(res.cookie).toHaveBeenCalledWith(
        'accessToken',
        'admin-access',
        expect.any(Object),
      );
      expect(res.cookie).toHaveBeenCalledWith(
        'refreshToken',
        'admin-refresh',
        expect.any(Object),
      );
    });

    it('TC019 — should throw ForbiddenException when regular user uses /auth/admin/login', async () => {
      loginUseCase.execute.mockResolvedValue(left(AuthFailures.notAdmin()));

      await expect(
        controller.adminLogin(
          { email: 'user@gmail.com', password: 'Pass@1234' },
          mockRes() as any,
        ),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('POST /auth/refresh', () => {
    it('TC020 — should issue new tokens with valid refresh token', async () => {
      const res = mockRes();
      refreshUseCase.execute.mockResolvedValue(
        right({ accessToken: 'new-access', refreshToken: 'new-refresh' }),
      );

      const result = await controller.refresh(
        { token: 'valid-refresh-token' },
        res as any,
        mockReq() as any,
      );

      expect(res.cookie).toHaveBeenCalledWith(
        'accessToken',
        'new-access',
        expect.any(Object),
      );
      expect(result).toEqual({
        accessToken: 'new-access',
        refreshToken: 'new-refresh',
      });
    });

    it('TC021 — should throw UnauthorizedException with invalid refresh token', async () => {
      refreshUseCase.execute.mockResolvedValue(
        left(AuthFailures.invalidRefreshToken()),
      );

      await expect(
        controller.refresh(
          { token: 'bad-token' },
          mockRes() as any,
          mockReq() as any,
        ),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('GET /auth/me', () => {
    it('TC023 — should return user profile when authenticated', async () => {
      const result = await controller.me(mockUser as any);
      expect(result.user).toMatchObject({
        email: 'test@gmail.com',
        username: 'testuser',
      });
    });

    it('TC024 — should throw UnauthorizedException when no current user', async () => {
      await expect(controller.me(null as any)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('POST /auth/logout', () => {
    it('TC025 — should clear auth cookies on logout', async () => {
      const res = mockRes();
      logoutUseCase.execute.mockResolvedValue(right({}));

      await controller.logout(
        { refreshToken: 'some-token' },
        res as any,
        mockReq() as any,
      );

      expect(res.clearCookie).toHaveBeenCalledWith(
        'accessToken',
        expect.any(Object),
      );
      expect(res.clearCookie).toHaveBeenCalledWith(
        'refreshToken',
        expect.any(Object),
      );
    });
  });
});
