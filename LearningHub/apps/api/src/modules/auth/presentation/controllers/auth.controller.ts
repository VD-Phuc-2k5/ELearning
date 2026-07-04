import {
  Controller,
  Get,
  Post,
  Body,
  BadRequestException,
  ConflictException,
  ForbiddenException,
  UnauthorizedException,
  Res,
  Req,
} from '@nestjs/common';
import type { Response, Request } from 'express';
import { ApiTags } from '@nestjs/swagger';
import { Public } from '../../infrastructure/decorators/public.decorator';
import { RegisterUseCase } from '../../application/use-cases/register.use-case';
import { LoginUseCase } from '../../application/use-cases/login.use-case';
import { AdminRegisterUseCase } from '../../application/use-cases/admin-register.use-case';
import { RefreshTokenUseCase } from '../../application/use-cases/refresh-token.use-case';
import { LogoutUseCase } from '../../application/use-cases/logout.use-case';
import { RegisterDto } from '../../application/dto/register.dto';
import { LoginDto } from '../../application/dto/login.dto';
import { RefreshTokenDto } from '../../application/dto/refresh-token.dto';
import { LogoutDto } from '../../application/dto/logout.dto';
import { AuthFailures } from '../../domain/errors/auth.failures';
import { CurrentUser } from '../../infrastructure/decorators/current-user.decorator';
import { User } from '../../domain/entities/user.entity';
import { toUserResponse } from '../dto/user-response.dto';

function setAuthCookies(
  res: Response,
  accessToken: string,
  refreshToken: string,
) {
  res.cookie('accessToken', accessToken, {
    maxAge: 86400000,
    path: '/',
    sameSite: 'lax',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
  });
  res.cookie('refreshToken', refreshToken, {
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
    sameSite: 'lax',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
  });
}

function clearAuthCookies(res: Response) {
  res.clearCookie('accessToken', { path: '/', sameSite: 'lax' });
  res.clearCookie('refreshToken', { path: '/', sameSite: 'lax' });
}

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly registerUseCase: RegisterUseCase,
    private readonly loginUseCase: LoginUseCase,
    private readonly adminRegisterUseCase: AdminRegisterUseCase,
    private readonly refreshUseCase: RefreshTokenUseCase,
    private readonly logoutUseCase: LogoutUseCase,
  ) {}

  @Public()
  @Post('register')
  async register(@Body() dto: RegisterDto) {
    const result = await this.registerUseCase.execute(dto);
    if (result.type === 'left') {
      if (
        result.value instanceof AuthFailures &&
        (result.value.code === 'USER_ALREADY_EXISTS' ||
          result.value.code === 'USERNAME_ALREADY_EXISTS')
      ) {
        throw new ConflictException(result.value.message);
      }
      throw new BadRequestException(result.value.message);
    }
    return { user: toUserResponse(result.value.user) };
  }

  @Public()
  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.loginUseCase.execute({
      ...dto,
      rejectAdminRole: true,
    });
    if (result.type === 'left') {
      if (result.value instanceof AuthFailures) {
        if (
          result.value.code === 'USER_NOT_FOUND' ||
          result.value.code === 'INVALID_PASSWORD'
        ) {
          throw new UnauthorizedException(result.value.message);
        }
        if (result.value.code === 'ADMIN_NOT_ALLOWED') {
          throw new ForbiddenException(result.value.message);
        }
      }
      throw new BadRequestException(result.value.message);
    }
    setAuthCookies(res, result.value.accessToken, result.value.refreshToken);
    return result.value;
  }

  @Public()
  @Post('admin/login')
  async adminLogin(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.loginUseCase.execute({
      ...dto,
      requireAdminRole: true,
    });
    if (result.type === 'left') {
      if (result.value instanceof AuthFailures) {
        if (
          result.value.code === 'USER_NOT_FOUND' ||
          result.value.code === 'INVALID_PASSWORD'
        ) {
          throw new UnauthorizedException(result.value.message);
        }
        if (result.value.code === 'NOT_ADMIN') {
          throw new ForbiddenException(result.value.message);
        }
      }
      throw new BadRequestException(result.value.message);
    }
    setAuthCookies(res, result.value.accessToken, result.value.refreshToken);
    return result.value;
  }

  @Post('admin/register')
  async adminRegister(
    @Body() dto: RegisterDto,
    @CurrentUser() currentUser: User,
  ) {
    const result = await this.adminRegisterUseCase.execute({
      ...dto,
      createdBy: currentUser.id,
    });
    if (result.type === 'left') {
      if (
        result.value instanceof AuthFailures &&
        (result.value.code === 'USER_ALREADY_EXISTS' ||
          result.value.code === 'USERNAME_ALREADY_EXISTS')
      ) {
        throw new ConflictException(result.value.message);
      }
      throw new BadRequestException(result.value.message);
    }
    return { user: toUserResponse(result.value.user) };
  }

  @Public()
  @Post('refresh')
  async refresh(
    @Body() dto: RefreshTokenDto,
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request,
  ) {
    const token =
      dto.token ||
      (req.headers.cookie?.match(/(?:^|;\s*)refreshToken=([^;]*)/)?.[1] ?? '');
    const result = await this.refreshUseCase.execute({ token });
    if (result.type === 'left') {
      if (
        result.value instanceof AuthFailures &&
        result.value.code === 'INVALID_REFRESH_TOKEN'
      ) {
        throw new UnauthorizedException(result.value.message);
      }
      throw new BadRequestException(result.value.message);
    }
    setAuthCookies(res, result.value.accessToken, result.value.refreshToken);
    return result.value;
  }

  @Public()
  @Get('me')
  async me(@CurrentUser() currentUser: User) {
    if (!currentUser) throw new UnauthorizedException();
    return { user: toUserResponse(currentUser) };
  }

  @Public()
  @Post('logout')
  async logout(
    @Body() dto: LogoutDto,
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request,
  ) {
    const token =
      dto.refreshToken ||
      (req.headers.cookie?.match(/(?:^|;\s*)refreshToken=([^;]*)/)?.[1] ?? '');
    const result = await this.logoutUseCase.execute({ refreshToken: token });
    if (result.type === 'left') {
      if (
        result.value instanceof AuthFailures &&
        result.value.code === 'INVALID_REFRESH_TOKEN'
      ) {
        throw new UnauthorizedException(result.value.message);
      }
      throw new BadRequestException(result.value.message);
    }
    clearAuthCookies(res);
    return result.value;
  }
}
