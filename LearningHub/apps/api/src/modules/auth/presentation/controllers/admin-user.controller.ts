import {
  Controller,
  Get,
  Patch,
  Delete,
  Inject,
  Query,
  Param,
  Body,
  BadRequestException,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
} from '@nestjs/swagger';
import { CurrentUser } from '../../infrastructure/decorators/current-user.decorator';
import { IUserRepository } from '../../domain/repositories/i-user.repository';
import { User } from '../../domain/entities/user.entity';
import { UpdateUserUseCase } from '../../application/use-cases/update-user.use-case';
import { DeleteUserUseCase } from '../../application/use-cases/delete-user.use-case';
import { UpdateUserDto } from '../../application/dto/user.dto';
import { AuthFailures } from '../../domain/errors/auth.failures';
import { toUserResponse } from '../dto/response.dto';

function mapFailure(failure: AuthFailures): never {
  switch (failure.code) {
    case 'USER_NOT_FOUND':
      throw new NotFoundException(failure.message);
    case 'EMAIL_ALREADY_IN_USE':
      throw new ConflictException(failure.message);
    case 'CANNOT_DELETE_SELF':
      throw new ForbiddenException(failure.message);
    default:
      throw new BadRequestException(failure.message);
  }
}

@ApiTags('admin/users')
@ApiBearerAuth()
@Controller('admin/users')
export class AdminUserController {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepo: IUserRepository,
    private readonly updateUser: UpdateUserUseCase,
    private readonly deleteUser: DeleteUserUseCase,
  ) {}

  @Get('search')
  @ApiOperation({
    summary: 'Tìm user theo email (không phụ thuộc vai trò)',
  })
  @ApiQuery({ name: 'email', required: false, description: 'Từ khóa email' })
  async search(
    @Query('email') email: string,
    @CurrentUser() currentUser: User,
  ) {
    const users = await this.userRepo.searchByEmail(email ?? '');
    return users.filter((u) => u.id !== currentUser.id).map(toUserResponse);
  }

  @Get()
  @ApiOperation({
    summary: 'List users by role, excluding the requesting user',
  })
  @ApiQuery({
    name: 'role',
    required: true,
    description: 'Role code to filter by (e.g. ADMIN)',
  })
  async findAll(@Query('role') role: string, @CurrentUser() currentUser: User) {
    if (!role) throw new BadRequestException('Query param "role" is required');
    const users = await this.userRepo.findUsersByRole(role, currentUser.id);
    return users.map(toUserResponse);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a user' })
  async update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    const result = await this.updateUser.execute({ id, ...dto });
    if (result.type === 'left') mapFailure(result.value as AuthFailures);
    return toUserResponse(result.value!.user);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a user' })
  async remove(@Param('id') id: string, @CurrentUser() currentUser: User) {
    const result = await this.deleteUser.execute({
      id,
      actorId: currentUser.id,
    });
    if (result.type === 'left') mapFailure(result.value as AuthFailures);
    return result.value;
  }
}
