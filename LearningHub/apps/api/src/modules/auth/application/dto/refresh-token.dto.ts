import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class RefreshTokenDto {
  @ApiProperty({ example: 'refresh-token' })
  @IsString({ message: 'Token phải là chuỗi ký tự' })
  token!: string;
}
