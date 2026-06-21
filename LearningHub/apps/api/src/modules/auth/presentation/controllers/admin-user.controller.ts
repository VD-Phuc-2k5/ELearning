import {
  Controller,
  Get,
  Inject,
  Query,
  BadRequestException,
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

@ApiTags('admin/users')
@ApiBearerAuth()
@Controller('admin/users')
export class AdminUserController {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepo: IUserRepository,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'List users by role, excluding the requesting user',
  })
  @ApiQuery({
    name: 'role',
    required: true,
    description: 'Role code to filter by (e.g. ADMIN)',
  })
  findAll(@Query('role') role: string, @CurrentUser() currentUser: User) {
    if (!role) throw new BadRequestException('Query param "role" is required');
    return this.userRepo.findUsersByRole(role, currentUser.id);
  }
}
