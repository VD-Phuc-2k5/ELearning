'use server';

import { cookies } from 'next/headers';
import axios from 'axios';

const API_URL = process.env.NEST_API_URL || 'http://localhost:8080/api';

async function getAuthHeader() {
  const token = (await cookies()).get('adminToken')?.value ?? '';
  return { Authorization: `Bearer ${token}` };
}

export async function getProblems() {
  try {
    const headers = await getAuthHeader();
    const res = await axios.get(`${API_URL}/problems`, { headers });
    return res.data;
  } catch (error: any) {
    console.error(
      'Error fetching problems:',
      error.response?.data || error.message,
    );
    throw new Error(
      error.response?.data?.message || 'Failed to fetch problems',
    );
  }
}

export async function createProblem(data: {
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  timeLimitMs: number;
  memoryLimitMb: number;
  sampleInput: string | null;
  sampleOutput: string | null;
  languages: string[];
}) {
  try {
    const headers = await getAuthHeader();
    const res = await axios.post(`${API_URL}/problems`, data, { headers });
    return res.data;
  } catch (error: any) {
    console.error(
      'Error creating problem:',
      error.response?.data || error.message,
    );
    throw new Error(
      error.response?.data?.message || 'Failed to create problem',
    );
  }
}

export async function getTestCases(problemId: string) {
  try {
    const headers = await getAuthHeader();
    const res = await axios.get(`${API_URL}/problems/${problemId}/test-cases`, {
      headers,
    });
    return res.data;
  } catch (error: any) {
    console.error(
      'Error fetching test cases:',
      error.response?.data || error.message,
    );
    throw new Error(
      error.response?.data?.message || 'Failed to fetch test cases',
    );
  }
}

export async function createTestCase(
  problemId: string,
  data: {
    input: string;
    expectedOutput: string;
    isHidden?: boolean;
    orderIndex?: number;
    points?: number;
  },
) {
  try {
    const headers = await getAuthHeader();
    const res = await axios.post(
      `${API_URL}/problems/${problemId}/test-cases`,
      data,
      { headers },
    );
    return res.data;
  } catch (error: any) {
    console.error(
      'Error creating test case:',
      error.response?.data || error.message,
    );
    throw new Error(
      error.response?.data?.message || 'Failed to create test case',
    );
  }
}

export async function deleteTestCase(problemId: string, id: string) {
  try {
    const headers = await getAuthHeader();
    const res = await axios.delete(
      `${API_URL}/problems/${problemId}/test-cases/${id}`,
      { headers },
    );
    return res.data;
  } catch (error: any) {
    console.error(
      'Error deleting testcase:',
      error.response?.data || error.message,
    );
    throw new Error(
      error.response?.data?.message || 'Failed to delete testcase',
    );
  }
}

export async function updateProblem(
  id: string,
  data: {
    title?: string;
    description?: string;
    difficulty?: 'easy' | 'medium' | 'hard';
    timeLimitMs?: number;
    memoryLimitMb?: number;
    sampleInput?: string | null;
    sampleOutput?: string | null;
    languages?: string[];
    templates?: Record<string, string>;
    wrappers?: Record<string, string>;
  },
) {
  try {
    const headers = await getAuthHeader();
    const res = await axios.patch(`${API_URL}/problems/${id}`, data, {
      headers,
    });
    return res.data;
  } catch (error: any) {
    console.error(
      'Error updating problem:',
      error.response?.data || error.message,
    );
    throw new Error(
      error.response?.data?.message || 'Failed to update problem',
    );
  }
}

export async function deleteProblem(id: string) {
  try {
    const headers = await getAuthHeader();
    const res = await axios.delete(`${API_URL}/problems/${id}`, { headers });
    return res.data;
  } catch (error: any) {
    console.error(
      'Error deleting problem:',
      error.response?.data || error.message,
    );
    throw new Error(
      error.response?.data?.message || 'Failed to delete problem',
    );
  }
}

export async function importTestCases(problemId: string, formData: FormData) {
  try {
    const headers = {
      ...(await getAuthHeader()),
      'Content-Type': 'multipart/form-data',
    };
    const res = await axios.post(
      `${API_URL}/problems/${problemId}/test-cases/import-excel`,
      formData,
      { headers },
    );
    return res.data;
  } catch (error: any) {
    console.error(
      'Error importing test cases:',
      error.response?.data || error.message,
    );
    // Since getAxiosMessage handles errors object/array on client side, we should pass back the structured data if possible. But here, we can throw a detailed error message.
    const details = error.response?.data;
    if (details?.errors && Array.isArray(details.errors)) {
      throw new Error(
        details.errors.map((e: any) => `${e.field}: ${e.message}`).join(', '),
      );
    }
    if (Array.isArray(details?.message)) {
      throw new Error(details.message.join(', '));
    }
    throw new Error(
      details?.message || error.message || 'Failed to import test cases',
    );
  }
}

export async function getTestCasesTemplate() {
  try {
    const headers = await getAuthHeader();
    const res = await axios.get(
      `${API_URL}/problems/test-cases/excel-template`,
      {
        headers,
        responseType: 'arraybuffer',
      },
    );
    return {
      data: Buffer.from(res.data).toString('base64'),
      contentType:
        res.headers['content-type'] ||
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    };
  } catch (error: any) {
    console.error('Error fetching template:', error.message);
    throw new Error('Không thể tải file mẫu từ hệ thống');
  }
}
