import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PollOptionDto } from './poll-option.dto';

export class PollDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  question!: string;

  @ApiProperty({ type: [PollOptionDto] })
  @IsArray()
  @ArrayMinSize(2, { message: 'Phải có ít nhất 2 lựa chọn' })
  @ValidateNested({ each: true })
  @Type(() => PollOptionDto)
  options!: PollOptionDto[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString({}, { message: 'endsAt phải là ngày hợp lệ' })
  endsAt?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isMultipleChoice?: boolean;
}
