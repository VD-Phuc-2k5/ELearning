import {
  Controller,
  Post,
  Body,
  BadRequestException,
  ConflictException,
  ForbiddenException,
  UnauthorizedException,
  UseGuards,
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
import { AuthFailures } from '../../domain/errors/auth.failures';
import { JwtAuthGuard } from '../../infrastructure/guards/jwt-auth.guard';
import { PermissionGuard } from '../../infrastructure/guards/permission.guard';
import { RequirePermissions } from '../../infrastructure/decorators/require-permissions.decorator';
import { CurrentUser } from '../../infrastructure/decorators/current-user.decorator';
import { User } from '../../domain/entities/user.entity';

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
        result.value.code === 'USER_ALREADY_EXISTS'
      ) {
        throw new ConflictException(result.value.message);
      }
      throw new BadRequestException(result.value.message);
    }
    return result.value;
  }

  @Public()
  @Post('login')
  async login(@Body() dto: LoginDto) {
    const result = await this.loginUseCase.execute(dto);
    if (result.type === 'left') {
      if (
        result.value instanceof AuthFailures &&
        (result.value.code === 'USER_NOT_FOUND' ||
          result.value.code === 'INVALID_PASSWORD')
      ) {
        throw new UnauthorizedException(result.value.message);
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
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermissions('admin:write')
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
    return result.value;
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
}
