import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class DismissReportDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  note?: string;
}
