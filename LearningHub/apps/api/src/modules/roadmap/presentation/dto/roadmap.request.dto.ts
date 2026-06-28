import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateRoadmapDto {
  @ApiProperty() @IsString() title!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
}

export class UpdateRoadmapDto {
  @ApiPropertyOptional() @IsOptional() @IsString() title?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() status?: string;
}

export class SetRoadmapItemsDto {
  @ApiProperty({
    type: [String],
    description: 'Ordered list of question bank UUIDs',
  })
  @IsArray()
  @IsUUID('4', { each: true })
  bankIds!: string[];
}
