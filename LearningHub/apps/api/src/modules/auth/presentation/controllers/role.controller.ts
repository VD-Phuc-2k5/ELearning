import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  UseGuards,
  Inject,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../infrastructure/guards/jwt-auth.guard';
import { PermissionGuard } from '../../infrastructure/guards/permission.guard';
import { RequirePermissions } from '../../infrastructure/decorators/require-permissions.decorator';
import { IRoleRepository } from '../../domain/repositories/i-role.repository';
import { IRolePermissionRepository } from '../../domain/repositories/i-role-permission.repository';
import { CreateRoleUseCase } from '../../application/use-cases/create-role.use-case';
import { UpdateRoleUseCase } from '../../application/use-cases/update-role.use-case';
import { DeleteRoleUseCase } from '../../application/use-cases/delete-role.use-case';
import { AssignPermissionToRoleUseCase } from '../../application/use-cases/assign-permission-to-role.use-case';
import { RemovePermissionFromRoleUseCase } from '../../application/use-cases/remove-permission-from-role.use-case';
import { CreateRoleDto, UpdateRoleDto } from '../../application/dto/role.dto';
import { AssignPermissionDto } from '../../application/dto/assign-permission.dto';
import { AuthFailures } from '../../domain/errors/auth.failures';

function mapFailure(failure: AuthFailures): never {
  switch (failure.code) {
    case 'ROLE_NOT_FOUND':
      throw new NotFoundException(failure.message);
    case 'PERMISSION_NOT_FOUND':
      throw new NotFoundException(failure.message);
    case 'ROLE_ALREADY_EXISTS':
      throw new ConflictException(failure.message);
    case 'ALREADY_ASSIGNED':
      throw new ConflictException(failure.message);
    default:
      throw new BadRequestException(failure.message);
  }
}

@ApiTags('admin/roles')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionGuard)
@Controller('admin/roles')
export class RoleController {
  constructor(
    @Inject('IRoleRepository')
    private readonly roleRepo: IRoleRepository,
    @Inject('IRolePermissionRepository')
    private readonly rolePermissionRepo: IRolePermissionRepository,
    private readonly createRole: CreateRoleUseCase,
    private readonly updateRole: UpdateRoleUseCase,
    private readonly deleteRole: DeleteRoleUseCase,
    private readonly assignPermission: AssignPermissionToRoleUseCase,
    private readonly removePermission: RemovePermissionFromRoleUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List all roles' })
  @RequirePermissions('admin:read')
  findAll() {
    return this.roleRepo.findAll();
  }

  @Post()
  @ApiOperation({ summary: 'Create a role' })
  @RequirePermissions('admin:write')
  async create(@Body() dto: CreateRoleDto) {
    const result = await this.createRole.execute(dto);
    if (result.type === 'left') mapFailure(result.value as AuthFailures);
    return result.value;
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a role' })
  @RequirePermissions('admin:write')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateRoleDto,
  ) {
    const result = await this.updateRole.execute({ id, ...dto });
    if (result.type === 'left') mapFailure(result.value as AuthFailures);
    return result.value;
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a role' })
  @RequirePermissions('admin:write')
  async remove(@Param('id', ParseIntPipe) id: number) {
    const result = await this.deleteRole.execute({ id });
    if (result.type === 'left') mapFailure(result.value as AuthFailures);
    return result.value;
  }

  @Get(':roleId/permissions')
  @ApiOperation({ summary: 'List permissions of a role' })
  @RequirePermissions('admin:read')
  getPermissions(@Param('roleId', ParseIntPipe) roleId: number) {
    return this.rolePermissionRepo.findPermissionsByRoleId(roleId);
  }

  @Post(':roleId/permissions')
  @ApiOperation({ summary: 'Assign permission to role' })
  @RequirePermissions('admin:write')
  async assignPerm(
    @Param('roleId', ParseIntPipe) roleId: number,
    @Body() dto: AssignPermissionDto,
  ) {
    const result = await this.assignPermission.execute({
      roleId,
      permissionId: dto.permissionId,
    });
    if (result.type === 'left') mapFailure(result.value as AuthFailures);
    return result.value;
  }

  @Delete(':roleId/permissions/:permissionId')
  @ApiOperation({ summary: 'Remove permission from role' })
  @RequirePermissions('admin:write')
  async removePerm(
    @Param('roleId', ParseIntPipe) roleId: number,
    @Param('permissionId', ParseIntPipe) permissionId: number,
  ) {
    const result = await this.removePermission.execute({
      roleId,
      permissionId,
    });
    if (result.type === 'left') mapFailure(result.value as AuthFailures);
    return result.value;
  }
}
