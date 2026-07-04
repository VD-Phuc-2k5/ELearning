import { ApiProperty } from '@nestjs/swagger';
import { ArrayMinSize, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ForumRuleDto } from './forum-rule.dto';

export class SetForumRulesDto {
  @ApiProperty({ type: [ForumRuleDto] })
  @IsArray()
  @ArrayMinSize(0)
  @ValidateNested({ each: true })
  @Type(() => ForumRuleDto)
  rules!: ForumRuleDto[];
}
