'use server';

import { cookies } from 'next/headers';
import axios from 'axios';

const API_URL = process.env.NEST_API_URL || 'http://localhost:8080/api';

async function getAuthHeader() {
  const token = (await cookies()).get('accessToken')?.value ?? '';
  return { Authorization: `Bearer ${token}` };
}

export async function getStudentProblems() {
  try {
    const headers = await getAuthHeader();
    const res = await axios.get(`${API_URL}/problems`, { headers });
    return res.data;
  } catch (error: any) {
    console.error(
      'Error fetching student problems:',
      error.response?.data || error.message,
    );
    throw new Error(
      error.response?.data?.message || 'Failed to fetch problems',
    );
  }
}

export async function getStudentProblemDetail(id: string) {
  try {
    const headers = await getAuthHeader();
    const res = await axios.get(`${API_URL}/problems/${id}`, { headers });
    return res.data;
  } catch (error: any) {
    console.error(
      'Error fetching problem detail:',
      error.response?.data || error.message,
    );
    throw new Error(
      error.response?.data?.message || 'Failed to fetch problem detail',
    );
  }
}

export async function submitStudentCode(
  problemId: string,
  data: { language: string; sourceCode: string },
) {
  try {
    const headers = await getAuthHeader();
    const res = await axios.post(
      `${API_URL}/problems/${problemId}/submit`,
      data,
      { headers },
    );
    return res.data;
  } catch (error: any) {
    console.error(
      'Error submitting code:',
      error.response?.data || error.message,
    );
    throw new Error(error.response?.data?.message || 'Failed to submit code');
  }
}

export async function getSubmissionStatus(submissionId: string) {
  try {
    const headers = await getAuthHeader();
    const res = await axios.get(`${API_URL}/submissions/${submissionId}`, {
      headers,
    });
    return res.data;
  } catch (error: any) {
    console.error(
      'Error fetching submission status:',
      error.response?.data || error.message,
    );
    throw new Error(
      error.response?.data?.message || 'Failed to fetch submission status',
    );
  }
}
