import {
    Controller,
    Post,
    Body,
    BadRequestException,
    ConflictException,
    UnauthorizedException,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { RegisterUseCase } from "../../application/use-cases/register.use-case";
import { LoginUseCase } from "../../application/use-cases/login.use-case";
import { RefreshTokenUseCase } from "../../application/use-cases/refresh-token.use-case";
import { LogoutUseCase } from "../../application/use-cases/logout.use-case";
import { RegisterDto } from "../../application/dto/register.dto";
import { LoginDto } from "../../application/dto/login.dto";
import { RefreshTokenDto } from "../../application/dto/refresh-token.dto";
import { LogoutDto } from "../../application/dto/logout.dto";
import { AuthFailures } from "../../domain/errors/auth.failures";

@ApiTags('auth')
@Controller('auth')
export class AuthController {
    constructor(
        private readonly registerUseCase: RegisterUseCase,
        private readonly loginUseCase: LoginUseCase,
        private readonly refreshUseCase: RefreshTokenUseCase,
        private readonly logoutUseCase: LogoutUseCase,
    ) { }

    @Post('register')
    async register(@Body() dto: RegisterDto) {
        const result = await this.registerUseCase.execute(dto);
        if (result.type === 'left') {
            if (result.value instanceof AuthFailures && result.value.code === 'USER_ALREADY_EXISTS') {
                throw new ConflictException(result.value.message);
            }
            throw new BadRequestException(result.value.message);
        }
        return result.value;
    }

    @Post('login')
    async login(@Body() dto: LoginDto) {
        const result = await this.loginUseCase.execute(dto);
        if (result.type === 'left') {
            if (result.value instanceof AuthFailures &&
                (result.value.code === 'USER_NOT_FOUND' || result.value.code === 'INVALID_PASSWORD')
            ) {
                throw new UnauthorizedException(result.value.message);
            }
            throw new BadRequestException(result.value.message);
        }
        return result.value;
    }

    @Post('refresh')
    async refresh(@Body() dto: RefreshTokenDto) {
        const result = await this.refreshUseCase.execute(dto);
        if (result.type === 'left') {
            if (result.value instanceof AuthFailures && result.value.code === 'INVALID_REFRESH_TOKEN') {
                throw new UnauthorizedException(result.value.message);
            }
            throw new BadRequestException(result.value.message);
        }
        return result.value;
    }

    @Post('logout')
    async logout(@Body() dto: LogoutDto) {
        const result = await this.logoutUseCase.execute(dto);
        if (result.type === 'left') {
            if (result.value instanceof AuthFailures && result.value.code === 'INVALID_REFRESH_TOKEN') {
                throw new UnauthorizedException(result.value.message);
            }
            throw new BadRequestException(result.value.message);
        }
        return result.value;
    }
}