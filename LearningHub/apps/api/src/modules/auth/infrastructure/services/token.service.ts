import * as crypto from 'crypto';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ITokenService } from '../../application/interfaces/i-token.service';
import { User } from '../../domain/entities/user.entity';

@Injectable()
export class TokenService implements ITokenService {
  constructor(private readonly jwtService: JwtService) {}
  generateAccessToken(user: User): string {
    return this.jwtService.sign(
      {
        sub: user.id,
        email: user.email,
      },
      {
        expiresIn: '15m',
      },
    );
  }

  generateRefreshToken(): string {
    return crypto.randomUUID();
  }
}
