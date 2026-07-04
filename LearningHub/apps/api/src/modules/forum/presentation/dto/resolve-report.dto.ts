import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ResolveReportDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  resolutionNote!: string;
}
