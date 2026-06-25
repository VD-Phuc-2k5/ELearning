import { Injectable, Inject, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, ExtractJwt } from "passport-jwt";
import { ConfigService } from "@nestjs/config";
import { IUserRepository } from "../../domain/repositories/i-user.repository";
import { User } from "../../domain/entities/user.entity";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        configService: ConfigService,
        @Inject('IUserRepository')
        private readonly userRepository: IUserRepository,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
        });
    }

    async validate(payload: { sub: string }): Promise<User> {
        const user = await this.userRepository.findById(payload.sub);
        if (!user || !user.isActive) throw new UnauthorizedException();
        return user;
    }
}