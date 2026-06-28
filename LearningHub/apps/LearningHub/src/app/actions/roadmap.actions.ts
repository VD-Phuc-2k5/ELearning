'use server';

import { Either, Failure } from '@learning-hub/core';
import {
  RoadmapRemoteDataSourceImpl,
  RoadmapRepositoryImpl,
} from '@learning-hub/data';
import type {
  CreateRoadmapParams,
  GetRoadmapsParams,
  Roadmap,
  RoadmapDetail,
  RoadmapItem,
  RoadmapList,
  UpdateRoadmapParams,
  UserRoadmapProgress,
} from '@learning-hub/domain';
import {
  CreateRoadmapUsecase,
  DeleteRoadmapParams,
  DeleteRoadmapUsecase,
  EnrollRoadmapParams,
  EnrollRoadmapUsecase,
  GetMyRoadmapProgressUsecase,
  GetMyRoadmapsUsecase,
  GetRoadmapDetailParams,
  GetRoadmapDetailUsecase,
  GetRoadmapsUsecase,
  SetRoadmapItemsParams,
  SetRoadmapItemsUsecase,
  UpdateRoadmapUsecaseParams,
  UpdateRoadmapUsecase,
} from '@learning-hub/domain';
import { cookies } from 'next/headers';

function unwrap<T>(r: Either<Failure, T>): T {
  if (r.type === 'left') throw new Error(r.value.message);
  return r.value;
}

async function getRepo() {
  const token = (await cookies()).get('accessToken')?.value ?? '';
  return new RoadmapRepositoryImpl(new RoadmapRemoteDataSourceImpl(), token);
}

export async function listRoadmaps(
  params?: GetRoadmapsParams,
): Promise<RoadmapList> {
  const repo = await getRepo();
  return unwrap(await new GetRoadmapsUsecase(repo).execute(params ?? {}));
}

export async function listMyRoadmaps(
  params?: GetRoadmapsParams,
): Promise<RoadmapList> {
  const repo = await getRepo();
  return unwrap(await new GetMyRoadmapsUsecase(repo).execute(params ?? {}));
}

export async function createRoadmap(
  data: CreateRoadmapParams,
): Promise<Roadmap> {
  const repo = await getRepo();
  return unwrap(await new CreateRoadmapUsecase(repo).execute(data));
}

export async function getRoadmapDetail(id: string): Promise<RoadmapDetail> {
  const repo = await getRepo();
  return unwrap(
    await new GetRoadmapDetailUsecase(repo).execute(
      new GetRoadmapDetailParams(id),
    ),
  );
}

export async function updateRoadmap(
  id: string,
  data: UpdateRoadmapParams,
): Promise<Roadmap> {
  const repo = await getRepo();
  return unwrap(
    await new UpdateRoadmapUsecase(repo).execute(
      new UpdateRoadmapUsecaseParams(id, data),
    ),
  );
}

export async function deleteRoadmap(id: string): Promise<void> {
  const repo = await getRepo();
  unwrap(
    await new DeleteRoadmapUsecase(repo).execute(new DeleteRoadmapParams(id)),
  );
}

export async function setRoadmapItems(
  id: string,
  bankIds: string[],
): Promise<RoadmapItem[]> {
  const repo = await getRepo();
  return unwrap(
    await new SetRoadmapItemsUsecase(repo).execute(
      new SetRoadmapItemsParams(id, bankIds),
    ),
  );
}

export async function enrollRoadmap(id: string): Promise<UserRoadmapProgress> {
  const repo = await getRepo();
  return unwrap(
    await new EnrollRoadmapUsecase(repo).execute(new EnrollRoadmapParams(id)),
  );
}

export async function getMyRoadmapProgress(): Promise<UserRoadmapProgress[]> {
  const token = (await cookies()).get('accessToken')?.value;
  if (!token) return [];
  const repo = new RoadmapRepositoryImpl(
    new RoadmapRemoteDataSourceImpl(),
    token,
  );
  const result = await new GetMyRoadmapProgressUsecase(repo).execute({});
  return result.type === 'right' ? result.value : [];
}
