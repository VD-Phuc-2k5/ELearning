import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  UseGuards,
  Inject,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../infrastructure/guards/jwt-auth.guard';
import { PermissionGuard } from '../../infrastructure/guards/permission.guard';
import { RequirePermissions } from '../../infrastructure/decorators/require-permissions.decorator';
import { CurrentUser } from '../../infrastructure/decorators/current-user.decorator';
import { IUserPermissionRepository } from '../../domain/repositories/i-user-permission.repository';
import { User } from '../../domain/entities/user.entity';
import { GrantUserPermissionUseCase } from '../../application/use-cases/grant-user-permission.use-case';
import { GrantUserPermissionDto } from '../../application/dto/user-permission.dto';
import { AuthFailures } from '../../domain/errors/auth.failures';

function mapFailure(failure: AuthFailures): never {
  switch (failure.code) {
    case 'USER_NOT_FOUND':
    case 'PERMISSION_NOT_FOUND':
      throw new NotFoundException(failure.message);
    default:
      throw new BadRequestException(failure.message);
  }
}

@ApiTags('admin/users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionGuard)
@Controller('admin/users/:userId/permissions')
export class UserPermissionController {
  constructor(
    @Inject('IUserPermissionRepository')
    private readonly userPermissionRepo: IUserPermissionRepository,
    private readonly grantUserPermission: GrantUserPermissionUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List direct permissions of a user' })
  @RequirePermissions('admin:read')
  findAll(@Param('userId') userId: string) {
    return this.userPermissionRepo.findByUserId(userId);
  }

  @Post()
  @ApiOperation({ summary: 'Grant or deny a permission for a user' })
  @RequirePermissions('admin:write')
  async grant(
    @Param('userId') userId: string,
    @Body() dto: GrantUserPermissionDto,
    @CurrentUser() currentUser: User,
  ) {
    const result = await this.grantUserPermission.execute({
      userId,
      permissionId: dto.permissionId,
      isGranted: dto.isGranted,
      grantedBy: currentUser.id,
    });
    if (result.type === 'left') mapFailure(result.value as AuthFailures);
    return result.value;
  }

  @Delete(':permissionId')
  @ApiOperation({ summary: 'Remove direct permission override for a user' })
  @RequirePermissions('admin:write')
  async remove(
    @Param('userId') userId: string,
    @Param('permissionId', ParseIntPipe) permissionId: number,
  ) {
    await this.userPermissionRepo.remove(userId, permissionId);
    return { success: true };
  }
}
