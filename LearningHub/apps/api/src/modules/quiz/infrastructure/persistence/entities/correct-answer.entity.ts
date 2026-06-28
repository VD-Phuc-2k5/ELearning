import { Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { QuestionEntity } from './question.entity';
import { AnswerOptionEntity } from './answer-option.entity';

@Entity('correct_answers')
export class CorrectAnswerEntity {
  @PrimaryColumn({ name: 'question_id', type: 'uuid' })
  questionId!: string;

  @PrimaryColumn({ name: 'option_id', type: 'uuid' })
  optionId!: string;

  @ManyToOne(() => QuestionEntity, (question) => question.correctAnswers, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'question_id' })
  question!: QuestionEntity;

  @ManyToOne(() => AnswerOptionEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'option_id' })
  option!: AnswerOptionEntity;
}
