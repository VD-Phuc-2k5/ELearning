import {
  Inject,
  Injectable,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import {
  TEST_CASE_REPOSITORY,
  ITestCaseRepository,
} from '../../domain/repositories/test-case.repository.interface';
import {
  CODING_PROBLEM_REPOSITORY,
  ICodingProblemRepository,
} from '../../domain/repositories/coding-problem.repository.interface';
import { TestCaseDomain } from '../../domain/entities/test-case.domain';
import { IUserRoleRepository } from '../../../auth/domain/repositories/i-user-role.repository';

@Injectable()
export class ManageTestCasesUseCase {
  constructor(
    @Inject(TEST_CASE_REPOSITORY)
    private readonly testCaseRepo: ITestCaseRepository,
    @Inject(CODING_PROBLEM_REPOSITORY)
    private readonly problemRepo: ICodingProblemRepository,
    @Inject('IUserRoleRepository')
    private readonly userRoleRepo: IUserRoleRepository,
  ) {}

  private async checkAdmin(userId: string): Promise<void> {
    const roles = await this.userRoleRepo.findByUserId(userId);
    const isAdmin = roles.some(
      (ur) => ur.role.code === 'ADMIN' || ur.role.code === 'OWNER',
    );
    if (!isAdmin) {
      throw new ForbiddenException(
        'Only administrators can perform this action',
      );
    }
  }

  async createTestCase(
    userId: string,
    problemId: string,
    params: Omit<TestCaseDomain, 'id' | 'problemId' | 'createdAt'>,
  ): Promise<TestCaseDomain> {
    await this.checkAdmin(userId);
    const problem = await this.problemRepo.findById(problemId);
    if (!problem) throw new NotFoundException('Coding problem not found');

    return this.testCaseRepo.create({
      ...params,
      problemId,
    });
  }

  async getTestCases(
    userId: string,
    problemId: string,
  ): Promise<TestCaseDomain[]> {
    await this.checkAdmin(userId);
    const problem = await this.problemRepo.findById(problemId);
    if (!problem) throw new NotFoundException('Coding problem not found');

    return this.testCaseRepo.findByProblemId(problemId);
  }

  async deleteTestCase(userId: string, id: string): Promise<void> {
    await this.checkAdmin(userId);
    const testCase = await this.testCaseRepo.findById(id);
    if (!testCase) throw new NotFoundException('TestCase not found');

    await this.testCaseRepo.delete(id);
  }

  async importTestCasesExcel(
    userId: string,
    problemId: string,
    fileBuffer: Buffer,
  ): Promise<{ message: string; count: number }> {
    await this.checkAdmin(userId);
    const problem = await this.problemRepo.findById(problemId);
    if (!problem) throw new NotFoundException('Coding problem not found');

    const workbook = new ExcelJS.Workbook();
    try {
      await workbook.xlsx.load(fileBuffer as unknown as ArrayBuffer);
    } catch (_err: unknown) {
      throw new BadRequestException(
        'Không thể đọc file Excel. File có thể bị hỏng hoặc sai định dạng.',
      );
    }

    const worksheet = workbook.worksheets[0];
    if (!worksheet) {
      throw new BadRequestException('File Excel không có sheet nào.');
    }

    const headerRow = worksheet.getRow(1);
    let inputCol = -1;
    let outputCol = -1;
    let pointsCol = -1;
    let hiddenCol = -1;
    let orderCol = -1;

    headerRow.eachCell((cell, colNumber) => {
      const val = String(cell.value || '')
        .trim()
        .toLowerCase();
      if (
        val === 'input' ||
        val.includes('đầu vào') ||
        val.includes('dau vao')
      ) {
        inputCol = colNumber;
      } else if (
        val === 'output' ||
        val.includes('đầu ra') ||
        val.includes('dau ra') ||
        val === 'expected'
      ) {
        outputCol = colNumber;
      } else if (
        val === 'points' ||
        val.includes('điểm') ||
        val.includes('diem')
      ) {
        pointsCol = colNumber;
      } else if (val === 'hidden' || val.includes('ẩn') || val.includes('an')) {
        hiddenCol = colNumber;
      } else if (
        val === 'order' ||
        val.includes('thứ tự') ||
        val.includes('thu tu')
      ) {
        orderCol = colNumber;
      }
    });

    // Fallback to absolute column indexes if headers are not found or matched
    if (inputCol === -1) inputCol = 1;
    if (outputCol === -1) outputCol = 2;
    if (pointsCol === -1) pointsCol = 3;
    if (hiddenCol === -1) hiddenCol = 4;
    if (orderCol === -1) orderCol = 5;

    const parsedTestCases: Omit<
      TestCaseDomain,
      'id' | 'problemId' | 'createdAt'
    >[] = [];

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // skip header row

      const inputVal = row.getCell(inputCol).value;
      const outputVal = row.getCell(outputCol).value;
      const pointsVal = row.getCell(pointsCol).value;
      const hiddenVal = row.getCell(hiddenCol).value;
      const orderVal = row.getCell(orderCol).value;

      // Extract raw strings from Excel cells (which could be string, number, or cell object)
      const getValString = (val: any): string => {
        if (val === null || val === undefined) return '';
        if (typeof val === 'object' && val.richText) {
          return val.richText.map((t: any) => t.text || '').join('');
        }
        if (typeof val === 'object' && val.text) {
          return String(val.text);
        }
        return String(val);
      };

      const input = getValString(inputVal).trim();
      const expectedOutput = getValString(outputVal).trim();

      // If the row is completely empty, skip it
      if (!input && !expectedOutput) return;

      if (!expectedOutput) {
        throw new BadRequestException(
          `Dòng ${rowNumber}: Đầu ra mong muốn (Expected Output) không được để trống`,
        );
      }

      // Points: default to 1 if not a valid number
      let points = 1;
      if (pointsVal !== null && pointsVal !== undefined) {
        const pNum = Number(pointsVal);
        if (!isNaN(pNum) && pNum >= 0) {
          points = Math.floor(pNum);
        } else {
          throw new BadRequestException(
            `Dòng ${rowNumber}: Điểm số phải là một số nguyên dương hợp lệ`,
          );
        }
      }

      // IsHidden: default to true. Check yes/no, true/false, có/không
      let isHidden = true;
      if (hiddenVal !== null && hiddenVal !== undefined) {
        const hStr = String(hiddenVal).trim().toLowerCase();
        if (
          hStr === 'không' ||
          hStr === 'khong' ||
          hStr === 'no' ||
          hStr === 'false' ||
          hStr === '0'
        ) {
          isHidden = false;
        }
      }

      // OrderIndex: default to row index
      let orderIndex = rowNumber - 1;
      if (orderVal !== null && orderVal !== undefined) {
        const oNum = Number(orderVal);
        if (!isNaN(oNum)) {
          orderIndex = Math.floor(oNum);
        } else {
          throw new BadRequestException(
            `Dòng ${rowNumber}: Thứ tự chạy phải là một số hợp lệ`,
          );
        }
      }

      parsedTestCases.push({
        input,
        expectedOutput,
        points,
        isHidden,
        orderIndex,
      });
    });

    if (parsedTestCases.length === 0) {
      throw new BadRequestException(
        'Không tìm thấy dữ liệu testcase hợp lệ trong file Excel.',
      );
    }

    // Save all test cases sequentially
    for (const tc of parsedTestCases) {
      await this.testCaseRepo.create({
        problemId,
        input: tc.input,
        expectedOutput: tc.expectedOutput,
        points: tc.points,
        isHidden: tc.isHidden,
        orderIndex: tc.orderIndex,
      });
    }

    return {
      message: `Đã import thành công ${parsedTestCases.length} test case từ file Excel.`,
      count: parsedTestCases.length,
    };
  }
}
