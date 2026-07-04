import { Injectable, Inject, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { IUserRepository } from '../../domain/repositories/i-user.repository';
import { User } from '../../domain/entities/user.entity';

function fromCookie(name: string) {
  return (req: Request): string | null => {
    const cookie = req.headers.cookie;
    if (!cookie) return null;
    const match = cookie.match(
      new RegExp(
        '(?:^|;\\s*)' +
          name.replace(/([.*+?^=!:${}()|[\]/\\])/g, '\\$1') +
          '=([^;]*)',
      ),
    );
    return match?.[1] ?? null;
  };
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        fromCookie('accessToken'),
      ]),
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
    });
  }

  async validate(payload: { sub: string }): Promise<User> {
    const user = await this.userRepository.findById(payload.sub);
    if (!user || !user.isActive) throw new UnauthorizedException();
    return user;
  }
}
