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
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { IPermissionRepository } from '../../domain/repositories/i-permission.repository';
import { IResourceRegistryService } from '../../application/interfaces/i-resource-registry.service';
import { CreatePermissionUseCase } from '../../application/use-cases/create-permission.use-case';
import { DeletePermissionUseCase } from '../../application/use-cases/delete-permission.use-case';
import { CreatePermissionDto } from '../../application/dto/permission.dto';
import { AuthFailures } from '../../domain/errors/auth.failures';

function mapFailure(failure: AuthFailures): never {
  switch (failure.code) {
    case 'PERMISSION_NOT_FOUND':
      throw new NotFoundException(failure.message);
    case 'PERMISSION_ALREADY_EXISTS':
      throw new ConflictException(failure.message);
    case 'RESOURCE_NOT_FOUND':
      throw new BadRequestException(failure.message);
    default:
      throw new BadRequestException(failure.message);
  }
}

@ApiTags('admin/permissions')
@ApiBearerAuth()
@Controller('admin/permissions')
export class PermissionController {
  constructor(
    @Inject('IPermissionRepository')
    private readonly permissionRepo: IPermissionRepository,
    @Inject('IResourceRegistryService')
    private readonly resourceRegistry: IResourceRegistryService,
    private readonly createPermission: CreatePermissionUseCase,
    private readonly deletePermission: DeletePermissionUseCase,
  ) {}

  @Get('resources')
  @ApiOperation({ summary: 'List all available resources (DB tables)' })
  getResources() {
    return { resources: this.resourceRegistry.getResources() };
  }

  @Get()
  @ApiOperation({ summary: 'List all permissions' })
  findAll() {
    return this.permissionRepo.findAll();
  }

  @Post()
  @ApiOperation({ summary: 'Create a permission' })
  async create(@Body() dto: CreatePermissionDto) {
    const result = await this.createPermission.execute(dto);
    if (result.type === 'left') mapFailure(result.value as AuthFailures);
    return result.value;
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a permission' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    const result = await this.deletePermission.execute({ id });
    if (result.type === 'left') mapFailure(result.value as AuthFailures);
    return result.value;
  }
}
