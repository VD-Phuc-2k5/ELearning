import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  Inject,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CurrentUser } from '../../infrastructure/decorators/current-user.decorator';
import { IUserPermissionRepository } from '../../domain/repositories/i-user-permission.repository';
import { IPermissionResolverService } from '../../application/interfaces/i-permission-resolver.service';
import { User } from '../../domain/entities/user.entity';
import { GrantUserPermissionUseCase } from '../../application/use-cases/grant-user-permission.use-case';
import { GrantUserPermissionDto } from '../../application/dto/user-permission.dto';
import { AuthFailures } from '../../domain/errors/auth.failures';
import {
  toUserPermissionsResponse,
  toUserPermissionResponse,
} from '../dto/response.dto';

function mapFailure(failure: AuthFailures): never {
  switch (failure.code) {
    case 'USER_NOT_FOUND':
    case 'PERMISSION_NOT_FOUND':
      throw new NotFoundException(failure.message);
    case 'SELF_PERMISSION_GRANT':
    case 'CANNOT_MODIFY_OWNER':
      throw new ForbiddenException(failure.message);
    default:
      throw new BadRequestException(failure.message);
  }
}

@ApiTags('admin/users')
@ApiBearerAuth()
@Controller('admin/users/:userId/permissions')
export class UserPermissionController {
  constructor(
    @Inject('IUserPermissionRepository')
    private readonly userPermissionRepo: IUserPermissionRepository,
    @Inject('IPermissionResolverService')
    private readonly permissionResolver: IPermissionResolverService,
    private readonly grantUserPermission: GrantUserPermissionUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List direct permissions of a user' })
  async findAll(@Param('userId') userId: string) {
    const userPermissions = await this.userPermissionRepo.findByUserId(userId);
    return toUserPermissionsResponse(userPermissions);
  }

  @Post()
  @ApiOperation({ summary: 'Grant or deny a permission for a user' })
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
    if (result.type === 'left') {
      mapFailure(result.value as AuthFailures);
      return;
    }
    return toUserPermissionResponse(result.value.userPermission);
  }

  @Delete(':permissionId')
  @ApiOperation({ summary: 'Remove direct permission override for a user' })
  async remove(
    @Param('userId') userId: string,
    @Param('permissionId', ParseIntPipe) permissionId: number,
    @CurrentUser() currentUser: User,
  ) {
    const [targetPerms, actorPerms] = await Promise.all([
      this.permissionResolver.getEffectivePermissions(userId),
      this.permissionResolver.getEffectivePermissions(currentUser.id),
    ]);
    if (targetPerms.has('*') && !actorPerms.has('*'))
      throw new ForbiddenException(
        'Admin cannot modify permissions of an owner',
      );
    await this.userPermissionRepo.remove(userId, permissionId);
    this.permissionResolver.invalidate(userId);
    return { success: true };
  }
}
