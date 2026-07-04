import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

// Entities
import { UserEntity } from './infrastructure/persistence/entities/user.entity';
import { RefreshTokenEntity } from './infrastructure/persistence/entities/refresh-token.entity';
import { RoleEntity } from './infrastructure/persistence/entities/role.entity';
import { PermissionEntity } from './infrastructure/persistence/entities/permission.entity';
import { RolePermissionEntity } from './infrastructure/persistence/entities/role-permission.entity';
import { UserRoleEntity } from './infrastructure/persistence/entities/user-role.entity';
import { UserPermissionEntity } from './infrastructure/persistence/entities/user-permission.entity';

// Repositories
import { UserRepository } from './infrastructure/persistence/repositories/user.repository';
import { RefreshTokenRepository } from './infrastructure/persistence/repositories/refresh-token.repository';
import { RoleRepository } from './infrastructure/persistence/repositories/role.repository';
import { PermissionRepository } from './infrastructure/persistence/repositories/permission.repository';
import { RolePermissionRepository } from './infrastructure/persistence/repositories/role-permission.repository';
import { UserRoleRepository } from './infrastructure/persistence/repositories/user-role.repository';
import { UserPermissionRepository } from './infrastructure/persistence/repositories/user-permission.repository';

// Services & Strategies
import { PasswordService } from './infrastructure/services/password.service';
import { HashService } from './infrastructure/services/hash.service';
import { TokenService } from './infrastructure/services/token.service';
import { PermissionResolverService } from './infrastructure/services/permission-resolver.service';
import { ResourceRegistryService } from './infrastructure/services/resource-registry.service';
import { JwtStrategy } from './infrastructure/strategies/jwt.strategy';
import { JwtAuthGuard } from './infrastructure/guards/jwt-auth.guard';
import { PermissionGuard } from './infrastructure/guards/permission.guard';
import { ResourceActionGuard } from './infrastructure/guards/resource-action.guard';

// Use Cases — Auth
import { RegisterUseCase } from './application/use-cases/register.use-case';
import { LoginUseCase } from './application/use-cases/login.use-case';
import { RefreshTokenUseCase } from './application/use-cases/refresh-token.use-case';
import { LogoutUseCase } from './application/use-cases/logout.use-case';
import { AdminRegisterUseCase } from './application/use-cases/admin-register.use-case';
import { UpdateUserUseCase } from './application/use-cases/update-user.use-case';
import { DeleteUserUseCase } from './application/use-cases/delete-user.use-case';

// Use Cases — RBAC
import { CreateRoleUseCase } from './application/use-cases/create-role.use-case';
import { UpdateRoleUseCase } from './application/use-cases/update-role.use-case';
import { DeleteRoleUseCase } from './application/use-cases/delete-role.use-case';
import { CreatePermissionUseCase } from './application/use-cases/create-permission.use-case';
import { DeletePermissionUseCase } from './application/use-cases/delete-permission.use-case';
import { AssignPermissionToRoleUseCase } from './application/use-cases/assign-permission-to-role.use-case';
import { RemovePermissionFromRoleUseCase } from './application/use-cases/remove-permission-from-role.use-case';
import { AssignRoleToUserUseCase } from './application/use-cases/assign-role-to-user.use-case';
import { RemoveRoleFromUserUseCase } from './application/use-cases/remove-role-from-user.use-case';
import { GrantUserPermissionUseCase } from './application/use-cases/grant-user-permission.use-case';

// Controllers
import { AuthController } from './presentation/controllers/auth.controller';
import { AdminUserController } from './presentation/controllers/admin-user.controller';
import { RoleController } from './presentation/controllers/role.controller';
import { PermissionController } from './presentation/controllers/permission.controller';
import { UserRoleController } from './presentation/controllers/user-role.controller';
import { UserPermissionController } from './presentation/controllers/user-permission.controller';

@Module({
  imports: [
    PassportModule,
    TypeOrmModule.forFeature([
      UserEntity,
      RefreshTokenEntity,
      RoleEntity,
      PermissionEntity,
      RolePermissionEntity,
      UserRoleEntity,
      UserPermissionEntity,
    ]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1d' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [
    AuthController,
    AdminUserController,
    RoleController,
    PermissionController,
    UserRoleController,
    UserPermissionController,
  ],
  providers: [
    // Repositories
    { provide: 'IUserRepository', useClass: UserRepository },
    { provide: 'IRefreshTokenRepository', useClass: RefreshTokenRepository },
    { provide: 'IRoleRepository', useClass: RoleRepository },
    { provide: 'IPermissionRepository', useClass: PermissionRepository },
    {
      provide: 'IRolePermissionRepository',
      useClass: RolePermissionRepository,
    },
    { provide: 'IUserRoleRepository', useClass: UserRoleRepository },
    {
      provide: 'IUserPermissionRepository',
      useClass: UserPermissionRepository,
    },
    // Services / Strategies
    { provide: 'IPasswordService', useClass: PasswordService },
    { provide: 'IHashService', useClass: HashService },
    { provide: 'ITokenService', useClass: TokenService },
    {
      provide: 'IPermissionResolverService',
      useClass: PermissionResolverService,
    },
    { provide: 'IResourceRegistryService', useClass: ResourceRegistryService },
    ResourceRegistryService,
    JwtStrategy,
    JwtAuthGuard,
    PermissionGuard,
    ResourceActionGuard,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: ResourceActionGuard },
    // Use Cases — Auth
    RegisterUseCase,
    LoginUseCase,
    AdminRegisterUseCase,
    RefreshTokenUseCase,
    LogoutUseCase,
    // Use Cases — RBAC
    CreateRoleUseCase,
    UpdateRoleUseCase,
    DeleteRoleUseCase,
    CreatePermissionUseCase,
    DeletePermissionUseCase,
    AssignPermissionToRoleUseCase,
    RemovePermissionFromRoleUseCase,
    AssignRoleToUserUseCase,
    RemoveRoleFromUserUseCase,
    GrantUserPermissionUseCase,
    UpdateUserUseCase,
    DeleteUserUseCase,
  ],
})
export class AuthModule {}
