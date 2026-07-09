'use server';

async function unwrapOrThrow<T>(
  promise: Promise<{ type: string; value: any }>,
): Promise<T> {
  const result = await promise;
  if (result.type === 'left') throw new Error(result.value.message);
  return result.value;
}

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; message: string };

async function unwrapOrResult<T>(
  promise: Promise<{ type: string; value: any }>,
  fallbackMessage = 'Something went wrong',
): Promise<ActionResult<T>> {
  try {
    const result = await promise;
    if (result.type === 'left') {
      return {
        success: false,
        message: result.value?.message || fallbackMessage,
      };
    }
    return { success: true, data: result.value };
  } catch (e) {
    return {
      success: false,
      message: e instanceof Error ? e.message : fallbackMessage,
    };
  }
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
  try {
    const repo = getRepo();
    return unwrapOrThrow(new GetRoadmapsUsecase(repo).execute(params ?? {}));
  } catch {
    return { data: [], total: 0 };
  }
}

export async function listMyRoadmaps(
  params?: GetRoadmapsParams,
): Promise<RoadmapList> {
  try {
    const repo = getRepo();
    return unwrapOrThrow(new GetMyRoadmapsUsecase(repo).execute(params ?? {}));
  } catch {
    return { data: [], total: 0 };
  }
}

export async function createRoadmap(
  data: CreateRoadmapParams,
): Promise<ActionResult<Roadmap>> {
  const repo = getRepo();
  return unwrapOrResult(new CreateRoadmapUsecase(repo).execute(data));
}

export async function getRoadmapDetail(
  id: string,
): Promise<RoadmapDetail | null> {
  try {
    const repo = getRepo();
    return unwrapOrThrow(
      new GetRoadmapDetailUsecase(repo).execute(new GetRoadmapDetailParams(id)),
    );
  } catch {
    return null;
  }
}

export async function updateRoadmap(
  id: string,
  data: UpdateRoadmapParams,
): Promise<ActionResult<Roadmap>> {
  const repo = getRepo();
  return unwrapOrResult(
    new UpdateRoadmapUsecase(repo).execute(
      new UpdateRoadmapUsecaseParams(id, data),
    ),
  );
}

export async function deleteRoadmap(id: string): Promise<ActionResult<void>> {
  const repo = getRepo();
  return unwrapOrResult(
    new DeleteRoadmapUsecase(repo).execute(new DeleteRoadmapParams(id)),
  );
}

export async function setRoadmapItems(
  id: string,
  bankIds: string[],
): Promise<ActionResult<RoadmapItem[]>> {
  const repo = getRepo();
  return unwrapOrResult(
    new SetRoadmapItemsUsecase(repo).execute(
      new SetRoadmapItemsParams(id, bankIds),
    ),
  );
}

export async function enrollRoadmap(
  id: string,
): Promise<ActionResult<UserRoadmapProgress>> {
  const repo = getRepo();
  return unwrapOrResult(
    new EnrollRoadmapUsecase(repo).execute(new EnrollRoadmapParams(id)),
  );
}

export async function getMyRoadmapProgress(): Promise<UserRoadmapProgress[]> {
  const result = await new GetMyRoadmapProgressUsecase(getRepo()).execute({});
  return result.type === 'right' ? result.value : [];
}
