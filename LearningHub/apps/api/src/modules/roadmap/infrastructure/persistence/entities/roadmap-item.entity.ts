import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { RoadmapEntity } from './roadmap.entity';
import { QuestionBankEntity } from '../../../../quiz/infrastructure/persistence/entities/question-bank.entity';

@Entity('roadmap_items')
export class RoadmapItemEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'roadmap_id' })
  roadmapId!: string;

  @ManyToOne(() => RoadmapEntity)
  @JoinColumn({ name: 'roadmap_id' })
  roadmap!: RoadmapEntity;

  @Column({ name: 'question_bank_id' })
  questionBankId!: string;

  @ManyToOne(() => QuestionBankEntity)
  @JoinColumn({ name: 'question_bank_id' })
  questionBank!: QuestionBankEntity;

  @Column()
  position!: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
