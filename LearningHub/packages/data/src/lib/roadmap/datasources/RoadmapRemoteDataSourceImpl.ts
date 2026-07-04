import axios from 'axios';
import { handleAxiosError } from '@learning-hub/core';
import { getServerCookies } from '../../serverCookies';
import {
  CreateRoadmapParams,
  GetRoadmapsParams,
  Roadmap,
  RoadmapDetail,
  RoadmapItem,
  RoadmapList,
  UpdateRoadmapParams,
  UserRoadmapProgress,
} from '@learning-hub/domain';
import { IRoadmapRemoteDataSource } from './IRoadmapRemoteDataSource';

const NEST_API = process.env.NEST_API_URL || 'http://localhost:8080';

export class RoadmapRemoteDataSourceImpl implements IRoadmapRemoteDataSource {
  private api = axios.create({
    baseURL: NEST_API,
    withCredentials: true,
  });

  constructor() {
    this.api.interceptors.request.use(async (config) => {
      config.headers.Cookie = await getServerCookies();
      return config;
    });
  }

  async getRoadmaps(params: GetRoadmapsParams): Promise<RoadmapList> {
    try {
      const res = await this.api.get('/roadmaps', { params });
      return res.data;
    } catch (e) {
      return handleAxiosError(e);
    }
  }

  async getMyRoadmaps(params: GetRoadmapsParams): Promise<RoadmapList> {
    try {
      const res = await this.api.get('/roadmaps/mine', { params });
      return res.data;
    } catch (e) {
      return handleAxiosError(e);
    }
  }

  async createRoadmap(params: CreateRoadmapParams): Promise<Roadmap> {
    try {
      const res = await this.api.post('/roadmaps', params);
      return res.data;
    } catch (e) {
      return handleAxiosError(e);
    }
  }

  async getRoadmapDetail(id: string): Promise<RoadmapDetail> {
    try {
      const res = await this.api.get(`/roadmaps/${id}`);
      return res.data;
    } catch (e) {
      return handleAxiosError(e);
    }
  }

  async updateRoadmap(
    id: string,
    params: UpdateRoadmapParams,
  ): Promise<Roadmap> {
    try {
      const res = await this.api.patch(`/roadmaps/${id}`, params);
      return res.data;
    } catch (e) {
      return handleAxiosError(e);
    }
  }

  async deleteRoadmap(id: string): Promise<void> {
    try {
      await this.api.delete(`/roadmaps/${id}`);
    } catch (e) {
      return handleAxiosError(e);
    }
  }

  async setRoadmapItems(id: string, bankIds: string[]): Promise<RoadmapItem[]> {
    try {
      const res = await this.api.put(`/roadmaps/${id}/items`, { bankIds });
      return res.data;
    } catch (e) {
      return handleAxiosError(e);
    }
  }

  async enrollRoadmap(id: string): Promise<UserRoadmapProgress> {
    try {
      const res = await this.api.post(`/roadmaps/${id}/enroll`, {});
      return res.data;
    } catch (e) {
      return handleAxiosError(e);
    }
  }

  async getMyRoadmapProgress(): Promise<UserRoadmapProgress[]> {
    try {
      const res = await this.api.get('/roadmaps/my-progress');
      return res.data;
    } catch (e) {
      return handleAxiosError(e);
    }
  }
}
