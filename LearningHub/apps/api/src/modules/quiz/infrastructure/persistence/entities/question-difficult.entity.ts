import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { QuestionEntity } from './question.entity';

@Entity('question_difficult')
export class QuestionDifficultEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'question_id' })
  questionId!: string;

  @ManyToOne(() => QuestionEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'question_id' })
  question!: QuestionEntity;

  @Column()
  name!: string; // 'Beginner', 'Intermediate', 'Advanced'

  @Column({ nullable: true })
  description!: string;
}
