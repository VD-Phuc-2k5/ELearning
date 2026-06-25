import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { QuestionEntity } from '../entities/question.entity';
import { AnswerOptionEntity } from '../entities/answer-option.entity';
import { CorrectAnswerEntity } from '../entities/correct-answer.entity';
import {
  IQuestionRepository,
  CreateQuestionInput,
} from '../../../domain/repositories/question.repository.interface';
import {
  QuestionDomain,
  AnswerOptionDomain,
} from '../../../domain/entities/question.domain';

@Injectable()
export class QuestionRepository implements IQuestionRepository {
  constructor(
    @InjectRepository(QuestionEntity)
    private readonly repo: Repository<QuestionEntity>,
    private readonly dataSource: DataSource,
  ) {}

  private toDomain(entity: QuestionEntity, hideAnswers: boolean): QuestionDomain {
    const correctIds = hideAnswers
      ? []
      : entity.correctAnswers?.map((ca) => ca.optionId) ?? [];

    return {
      id: entity.id,
      questionBankId: entity.questionBankId,
      content: entity.content,
      explanation: hideAnswers ? null : entity.explanation,
      answerOptions:
        entity.answerOptions?.map(
          (opt): AnswerOptionDomain => ({
            id: opt.id,
            optionLabel: opt.optionLabel,
            content: opt.content,
          }),
        ) ?? [],
      correctAnswerOptionIds: correctIds,
    };
  }

  async createMany(questions: CreateQuestionInput[]): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      for (const q of questions) {
        const questionEntity = manager.create(QuestionEntity, {
          questionBankId: q.questionBankId,
          content: q.content,
          explanation: q.explanation,
        });
        const savedQuestion = await manager.save(questionEntity);

        const optionEntities = q.answerOptions.map((opt) =>
          manager.create(AnswerOptionEntity, {
            questionId: savedQuestion.id,
            optionLabel: opt.optionLabel,
            content: opt.content,
          }),
        );
        const savedOptions = await manager.save(optionEntities);

        const correctOptions = savedOptions.filter((opt) =>
          q.correctOptionLabels.includes(opt.optionLabel),
        );
        const correctAnswerEntities = correctOptions.map((opt) =>
          manager.create(CorrectAnswerEntity, {
            questionId: savedQuestion.id,
            optionId: opt.id,
          }),
        );
        await manager.save(correctAnswerEntities);
      }
    });
  }

  async findByBankId(bankId: string, hideAnswers: boolean): Promise<QuestionDomain[]> {
    const entities = await this.repo.find({
      where: { questionBankId: bankId },
      relations: ['answerOptions', 'correctAnswers'],
    });
    return entities.map((e) => this.toDomain(e, hideAnswers));
  }

  async findById(id: string): Promise<QuestionDomain | null> {
    const entity = await this.repo.findOne({
      where: { id },
      relations: ['answerOptions', 'correctAnswers'],
    });
    if (!entity) return null;
    return this.toDomain(entity, false);
  }
}
