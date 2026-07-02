import {
  Controller,
  Post,
  Get,
  Query,
  Body,
  BadRequestException,
  ConflictException,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
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
import { ForgotPasswordDto } from '../../application/dto/forgot-password.dto';
import { ResetPasswordDto } from '../../application/dto/reset-password.dto';
import { ForgotPasswordUseCase } from '../../application/use-cases/forgot-password.use-case';
import { ResetPasswordUseCase } from '../../application/use-cases/reset-password.use-case';
import { VerifyResetTokenUseCase } from '../../application/use-cases/verify-reset-token.use-case';
import { AuthFailures } from '../../domain/errors/auth.failures';
import { CurrentUser } from '../../infrastructure/decorators/current-user.decorator';
import { User } from '../../domain/entities/user.entity';
import { toUserResponse } from '../dto/response.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly registerUseCase: RegisterUseCase,
    private readonly loginUseCase: LoginUseCase,
    private readonly adminRegisterUseCase: AdminRegisterUseCase,
    private readonly refreshUseCase: RefreshTokenUseCase,
    private readonly logoutUseCase: LogoutUseCase,
    private readonly forgotPasswordUseCase: ForgotPasswordUseCase,
    private readonly resetPasswordUseCase: ResetPasswordUseCase,
    private readonly verifyResetTokenUseCase: VerifyResetTokenUseCase,
  ) {}

  @Public()
  @Post('register')
  async register(@Body() dto: RegisterDto) {
    const result = await this.registerUseCase.execute(dto);
    if (result.type === 'left') {
      if (
        result.value instanceof AuthFailures &&
        result.value.code === 'USER_ALREADY_EXISTS'
      ) {
        throw new ConflictException(result.value.message);
      }
      throw new BadRequestException(result.value.message);
    }
    return { user: toUserResponse(result.value.user) };
  }

  @Public()
  @Post('login')
  async login(@Body() dto: LoginDto) {
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
    return result.value;
  }

  @Public()
  @Post('admin/login')
  async adminLogin(@Body() dto: LoginDto) {
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
        result.value.code === 'USER_ALREADY_EXISTS'
      ) {
        throw new ConflictException(result.value.message);
      }
      throw new BadRequestException(result.value.message);
    }
    return { user: toUserResponse(result.value.user) };
  }

  @Public()
  @Post('refresh')
  async refresh(@Body() dto: RefreshTokenDto) {
    const result = await this.refreshUseCase.execute(dto);
    if (result.type === 'left') {
      if (
        result.value instanceof AuthFailures &&
        result.value.code === 'INVALID_REFRESH_TOKEN'
      ) {
        throw new UnauthorizedException(result.value.message);
      }
      throw new BadRequestException(result.value.message);
    }
    return result.value;
  }

  @Public()
  @Post('logout')
  async logout(@Body() dto: LogoutDto) {
    const result = await this.logoutUseCase.execute(dto);
    if (result.type === 'left') {
      if (
        result.value instanceof AuthFailures &&
        result.value.code === 'INVALID_REFRESH_TOKEN'
      ) {
        throw new UnauthorizedException(result.value.message);
      }
      throw new BadRequestException(result.value.message);
    }
    return result.value;
  }

  @Public()
  @Post('forgot-password')
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    const result = await this.forgotPasswordUseCase.execute(dto);
    if (result.type === 'left') {
      throw new BadRequestException(result.value.message);
    }
    return { success: true };
  }

  @Public()
  @Post('reset-password')
  async resetPassword(@Body() dto: ResetPasswordDto) {
    const result = await this.resetPasswordUseCase.execute(dto);
    if (result.type === 'left') {
      throw new BadRequestException(result.value.message);
    }
    return { success: true };
  }

  @Public()
  @Get('verify-reset-token')
  async verifyResetToken(@Query('token') token: string) {
    const result = await this.verifyResetTokenUseCase.execute({ token });
    if (result.type === 'left') {
      throw new BadRequestException(result.value.message);
    }
    return { valid: true };
  }
}
