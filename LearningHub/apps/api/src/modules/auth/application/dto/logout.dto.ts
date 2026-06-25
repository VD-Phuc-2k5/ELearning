import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class LogoutDto {
  @ApiProperty({ example: 'refresh-token' })
  @IsString({ message: 'Refresh token phải là chuỗi ký tự' })
  refreshToken!: string;
}
