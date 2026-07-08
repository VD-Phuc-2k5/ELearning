'use server';

async function unwrapOrThrow<T>(
  promise: Promise<{ type: string; value: any }>,
): Promise<T> {
  const result = await promise;
  if (result.type === 'left') throw new Error(result.value.message);
  return result.value;
}
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
function getRepo() {
  return new RoadmapRepositoryImpl(new RoadmapRemoteDataSourceImpl());
}

export async function listRoadmaps(
  params?: GetRoadmapsParams,
): Promise<RoadmapList> {
  const repo = getRepo();
  return unwrapOrThrow(new GetRoadmapsUsecase(repo).execute(params ?? {}));
}

export async function listMyRoadmaps(
  params?: GetRoadmapsParams,
): Promise<RoadmapList> {
  const repo = getRepo();
  return unwrapOrThrow(new GetMyRoadmapsUsecase(repo).execute(params ?? {}));
}

export async function createRoadmap(
  data: CreateRoadmapParams,
): Promise<Roadmap> {
  const repo = getRepo();
  return unwrapOrThrow(new CreateRoadmapUsecase(repo).execute(data));
}

export async function getRoadmapDetail(id: string): Promise<RoadmapDetail> {
  const repo = getRepo();
  return unwrapOrThrow(
    new GetRoadmapDetailUsecase(repo).execute(new GetRoadmapDetailParams(id)),
  );
}

export async function updateRoadmap(
  id: string,
  data: UpdateRoadmapParams,
): Promise<Roadmap> {
  const repo = getRepo();
  return unwrapOrThrow(
    new UpdateRoadmapUsecase(repo).execute(
      new UpdateRoadmapUsecaseParams(id, data),
    ),
  );
}

export async function deleteRoadmap(id: string): Promise<void> {
  const repo = getRepo();
  unwrapOrThrow(
    new DeleteRoadmapUsecase(repo).execute(new DeleteRoadmapParams(id)),
  );
}

export async function setRoadmapItems(
  id: string,
  bankIds: string[],
): Promise<RoadmapItem[]> {
  const repo = getRepo();
  return unwrapOrThrow(
    new SetRoadmapItemsUsecase(repo).execute(
      new SetRoadmapItemsParams(id, bankIds),
    ),
  );
}

export async function enrollRoadmap(id: string): Promise<UserRoadmapProgress> {
  const repo = getRepo();
  return unwrapOrThrow(
    new EnrollRoadmapUsecase(repo).execute(new EnrollRoadmapParams(id)),
  );
}

export async function getMyRoadmapProgress(): Promise<UserRoadmapProgress[]> {
  const result = await new GetMyRoadmapProgressUsecase(getRepo()).execute({});
  return result.type === 'right' ? result.value : [];
}
