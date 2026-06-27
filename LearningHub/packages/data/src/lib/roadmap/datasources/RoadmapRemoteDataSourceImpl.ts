import axios from 'axios';
import {
  AuthenticationException,
  NetworkException,
  NotFoundException,
  PermissionException,
  UnknownException,
} from '@learning-hub/core';
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
  private api = axios.create({ baseURL: NEST_API });

  private auth(token: string) {
    return { Authorization: `Bearer ${token}` };
  }

  private handleError(e: unknown): never {
    if (axios.isAxiosError(e)) {
      const status = e.response?.status;
      const message: string = e.response?.data?.message ?? '';
      if (status === 401)
        throw new AuthenticationException(message || 'Unauthorized');
      if (status === 403) throw new PermissionException(message || 'Forbidden');
      if (status === 404) throw new NotFoundException(message || 'Not found');
      throw new UnknownException();
    }
    throw new NetworkException();
  }

  async getRoadmaps(
    params: GetRoadmapsParams,
    token: string,
  ): Promise<RoadmapList> {
    try {
      const res = await this.api.get('/api/roadmaps', {
        params,
        headers: this.auth(token),
      });
      return res.data;
    } catch (e) {
      return this.handleError(e);
    }
  }

  async createRoadmap(
    params: CreateRoadmapParams,
    token: string,
  ): Promise<Roadmap> {
    try {
      const res = await this.api.post('/api/roadmaps', params, {
        headers: this.auth(token),
      });
      return res.data;
    } catch (e) {
      return this.handleError(e);
    }
  }

  async getRoadmapDetail(id: string, token: string): Promise<RoadmapDetail> {
    try {
      const res = await this.api.get(`/api/roadmaps/${id}`, {
        headers: this.auth(token),
      });
      return res.data;
    } catch (e) {
      return this.handleError(e);
    }
  }

  async updateRoadmap(
    id: string,
    params: UpdateRoadmapParams,
    token: string,
  ): Promise<Roadmap> {
    try {
      const res = await this.api.patch(`/api/roadmaps/${id}`, params, {
        headers: this.auth(token),
      });
      return res.data;
    } catch (e) {
      return this.handleError(e);
    }
  }

  async deleteRoadmap(id: string, token: string): Promise<void> {
    try {
      await this.api.delete(`/api/roadmaps/${id}`, {
        headers: this.auth(token),
      });
    } catch (e) {
      return this.handleError(e);
    }
  }

  async setRoadmapItems(
    id: string,
    bankIds: string[],
    token: string,
  ): Promise<RoadmapItem[]> {
    try {
      const res = await this.api.put(
        `/api/roadmaps/${id}/items`,
        { bankIds },
        { headers: this.auth(token) },
      );
      return res.data;
    } catch (e) {
      return this.handleError(e);
    }
  }

  async enrollRoadmap(id: string, token: string): Promise<UserRoadmapProgress> {
    try {
      const res = await this.api.post(
        `/api/roadmaps/${id}/enroll`,
        {},
        { headers: this.auth(token) },
      );
      return res.data;
    } catch (e) {
      return this.handleError(e);
    }
  }

  async getMyRoadmapProgress(token: string): Promise<UserRoadmapProgress[]> {
    try {
      const res = await this.api.get('/api/roadmaps/my-progress', {
        headers: this.auth(token),
      });
      return res.data;
    } catch (e) {
      return this.handleError(e);
    }
  }
}
