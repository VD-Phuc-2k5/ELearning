import { IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignPermissionDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  permissionId!: number;
}
