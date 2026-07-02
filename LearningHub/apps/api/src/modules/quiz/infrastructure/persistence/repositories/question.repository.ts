import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { QuestionEntity } from '../entities/question.entity';
import { AnswerOptionEntity } from '../entities/answer-option.entity';
import { CorrectAnswerEntity } from '../entities/correct-answer.entity';
import {
  IQuestionRepository,
  CreateQuestionInput,
  UpdateQuestionInput,
} from '../../../domain/repositories/question.repository.interface';
import {
  QuestionDomain,
  AnswerOptionDomain,
} from '../../../domain/entities/question.domain';

@Injectable()
export class QuestionRepository implements IQuestionRepository {
  private readonly logger = new Logger(QuestionRepository.name);

  constructor(
    @InjectRepository(QuestionEntity)
    private readonly repo: Repository<QuestionEntity>,
    private readonly dataSource: DataSource,
  ) {}

  private toDomain(
    entity: QuestionEntity,
    hideAnswers: boolean,
  ): QuestionDomain {
    const correctIds = hideAnswers
      ? []
      : (entity.correctAnswers?.map((ca) => ca.optionId) ?? []);

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

  async findByBankId(
    bankId: string,
    hideAnswers: boolean,
  ): Promise<QuestionDomain[]> {
    const entities = await this.repo.find({
      where: { questionBankId: bankId },
      relations: { answerOptions: true, correctAnswers: true },
      order: { createdAt: 'ASC', id: 'ASC' },
    });
    return entities.map((e) => this.toDomain(e, hideAnswers));
  }

  async findById(id: string): Promise<QuestionDomain | null> {
    const entity = await this.repo.findOne({
      where: { id },
      relations: { answerOptions: true, correctAnswers: true },
    });
    if (!entity) return null;
    return this.toDomain(entity, false);
  }

  async update(
    id: string,
    input: UpdateQuestionInput,
  ): Promise<QuestionDomain> {
    try {
      await this.dataSource.transaction(async (manager) => {
        const question = await manager.findOne(QuestionEntity, {
          where: { id },
          relations: { answerOptions: true, correctAnswers: true },
        });
        if (!question) {
          throw new Error(`Không tìm thấy câu hỏi với ID: ${id}`);
        }

        if (input.content !== undefined) question.content = input.content;
        if (input.explanation !== undefined)
          question.explanation = input.explanation;
        await manager.save(question);

        let currentOptions = question.answerOptions;
        if (input.answerOptions !== undefined) {
          // Delete correct answers first since they reference the options
          await manager.delete(CorrectAnswerEntity, { questionId: id });
          await manager.delete(AnswerOptionEntity, { questionId: id });

          const optionEntities = input.answerOptions.map((opt) =>
            manager.create(AnswerOptionEntity, {
              questionId: id,
              optionLabel: opt.optionLabel,
              content: opt.content,
            }),
          );
          currentOptions = await manager.save(optionEntities);
        }

        const targetCorrectLabels =
          input.correctOptionLabels ??
          (input.answerOptions !== undefined
            ? (question.answerOptions
                ?.filter((opt) =>
                  (
                    question.correctAnswers?.map((ca) => ca.optionId) ?? []
                  ).includes(opt.id),
                )
                .map((opt) => opt.optionLabel) ?? [])
            : undefined);
        if (targetCorrectLabels !== undefined) {
          if (input.answerOptions === undefined) {
            await manager.delete(CorrectAnswerEntity, { questionId: id });
          }

          const correctOptions = currentOptions.filter((opt) =>
            targetCorrectLabels.includes(opt.optionLabel),
          );
          const correctAnswerEntities = correctOptions.map((opt) =>
            manager.create(CorrectAnswerEntity, {
              questionId: id,
              optionId: opt.id,
            }),
          );
          await manager.save(correctAnswerEntities);
        }
      });
    } catch (error) {
      this.logger.error(
        `Failed to update question ${id}: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }

    const updated = await this.findById(id);
    if (!updated) {
      throw new Error(`Không thể tải lại câu hỏi vừa cập nhật với ID: ${id}`);
    }
    return updated;
  }

  async delete(id: string): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      await manager.delete(CorrectAnswerEntity, { questionId: id });
      await manager.delete(AnswerOptionEntity, { questionId: id });
      await manager.delete(QuestionEntity, id);
    });
  }
}
