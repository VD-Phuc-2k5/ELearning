import { IsNumber, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GrantUserPermissionDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  permissionId!: number;

  @ApiProperty({
    example: true,
    description: 'true = grant, false = deny even if role has it',
  })
  @IsBoolean()
  isGranted!: boolean;
}
