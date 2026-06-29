import {
  AuthenticationFailure,
  Either,
  Failure,
  NetworkFailure,
  NotFoundFailure,
  PermissionFailure,
  UnknownFailure,
  left,
  right,
  AuthenticationException,
  NetworkException,
  NotFoundException,
  PermissionException,
} from '@learning-hub/core';
import {
  CreateRoadmapParams,
  GetRoadmapsParams,
  IRoadmapRepository,
  Roadmap,
  RoadmapDetail,
  RoadmapItem,
  RoadmapList,
  UpdateRoadmapParams,
  UserRoadmapProgress,
} from '@learning-hub/domain';
import { IRoadmapRemoteDataSource } from '../datasources/IRoadmapRemoteDataSource';

function toFailure(e: unknown): Failure {
  if (e instanceof AuthenticationException)
    return new AuthenticationFailure(e.message);
  if (e instanceof PermissionException) return new PermissionFailure();
  if (e instanceof NotFoundException) return new NotFoundFailure();
  if (e instanceof NetworkException) return new NetworkFailure();
  return new UnknownFailure();
}

export class RoadmapRepositoryImpl implements IRoadmapRepository {
  constructor(
    private dataSource: IRoadmapRemoteDataSource,
    token: string,
  ) {
    this.dataSource.setToken(token);
  }

  async getRoadmaps(
    params: GetRoadmapsParams,
  ): Promise<Either<Failure, RoadmapList>> {
    try {
      return right(await this.dataSource.getRoadmaps(params));
    } catch (e) {
      return left(toFailure(e));
    }
  }

  async getMyRoadmaps(
    params: GetRoadmapsParams,
  ): Promise<Either<Failure, RoadmapList>> {
    try {
      return right(await this.dataSource.getMyRoadmaps(params));
    } catch (e) {
      return left(toFailure(e));
    }
  }

  async createRoadmap(
    params: CreateRoadmapParams,
  ): Promise<Either<Failure, Roadmap>> {
    try {
      return right(await this.dataSource.createRoadmap(params));
    } catch (e) {
      return left(toFailure(e));
    }
  }

  async getRoadmapDetail(id: string): Promise<Either<Failure, RoadmapDetail>> {
    try {
      return right(await this.dataSource.getRoadmapDetail(id));
    } catch (e) {
      return left(toFailure(e));
    }
  }

  async updateRoadmap(
    id: string,
    params: UpdateRoadmapParams,
  ): Promise<Either<Failure, Roadmap>> {
    try {
      return right(await this.dataSource.updateRoadmap(id, params));
    } catch (e) {
      return left(toFailure(e));
    }
  }

  async deleteRoadmap(id: string): Promise<Either<Failure, void>> {
    try {
      await this.dataSource.deleteRoadmap(id);
      return right(undefined);
    } catch (e) {
      return left(toFailure(e));
    }
  }

  async setRoadmapItems(
    id: string,
    bankIds: string[],
  ): Promise<Either<Failure, RoadmapItem[]>> {
    try {
      return right(await this.dataSource.setRoadmapItems(id, bankIds));
    } catch (e) {
      return left(toFailure(e));
    }
  }

  async enrollRoadmap(
    id: string,
  ): Promise<Either<Failure, UserRoadmapProgress>> {
    try {
      return right(await this.dataSource.enrollRoadmap(id));
    } catch (e) {
      return left(toFailure(e));
    }
  }

  async getMyRoadmapProgress(): Promise<
    Either<Failure, UserRoadmapProgress[]>
  > {
    try {
      return right(await this.dataSource.getMyRoadmapProgress());
    } catch (e) {
      return left(toFailure(e));
    }
  }
}
