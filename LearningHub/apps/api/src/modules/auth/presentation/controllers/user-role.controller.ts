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
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CurrentUser } from '../../infrastructure/decorators/current-user.decorator';
import { IUserRoleRepository } from '../../domain/repositories/i-user-role.repository';
import { User } from '../../domain/entities/user.entity';
import { AssignRoleToUserUseCase } from '../../application/use-cases/assign-role-to-user.use-case';
import { RemoveRoleFromUserUseCase } from '../../application/use-cases/remove-role-from-user.use-case';
import { AssignRoleDto } from '../../application/dto/user-role.dto';
import { AuthFailures } from '../../domain/errors/auth.failures';
import {
  toUserRolesResponse,
  toUserRoleResponse,
} from '../dto/user-role-response.dto';

function mapFailure(failure: AuthFailures): never {
  switch (failure.code) {
    case 'USER_NOT_FOUND':
    case 'ROLE_NOT_FOUND':
      throw new NotFoundException(failure.message);
    case 'ALREADY_ASSIGNED':
      throw new ConflictException(failure.message);
    case 'USER_INACTIVE':
    case 'CANNOT_MODIFY_OWNER':
      throw new ForbiddenException(failure.message);
    default:
      throw new BadRequestException(failure.message);
  }
}

@ApiTags('admin/users')
@ApiBearerAuth()
@Controller('admin/users/:userId/roles')
export class UserRoleController {
  constructor(
    @Inject('IUserRoleRepository')
    private readonly userRoleRepo: IUserRoleRepository,
    private readonly assignRoleToUser: AssignRoleToUserUseCase,
    private readonly removeRoleFromUser: RemoveRoleFromUserUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List roles of a user' })
  async findAll(@Param('userId') userId: string) {
    const userRoles = await this.userRoleRepo.findByUserId(userId);
    return toUserRolesResponse(userRoles);
  }

  @Post()
  @ApiOperation({ summary: 'Assign role to user' })
  async assign(
    @Param('userId') userId: string,
    @Body() dto: AssignRoleDto,
    @CurrentUser() currentUser: User,
  ) {
    const result = await this.assignRoleToUser.execute({
      userId,
      roleId: dto.roleId,
      assignedBy: currentUser.id,
    });
    if (result.type === 'left') {
      mapFailure(result.value as AuthFailures);
      return;
    }
    return toUserRoleResponse(result.value.userRole);
  }

  @Delete(':roleId')
  @ApiOperation({ summary: 'Remove role from user' })
  async remove(
    @Param('userId') userId: string,
    @Param('roleId', ParseIntPipe) roleId: number,
    @CurrentUser() currentUser: User,
  ) {
    const result = await this.removeRoleFromUser.execute({
      userId,
      roleId,
      actorId: currentUser.id,
    });
    if (result.type === 'left') mapFailure(result.value as AuthFailures);
    return result.value;
  }
}
