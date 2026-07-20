import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import type { ForumVisibility } from '../../domain/entities/forum.domain';

export interface ForumSearchResult {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  visibility: ForumVisibility;
  headline: string | null;
  type: 'forum';
}

export interface PostSearchResult {
  id: string;
  post_id: string;
  title: string;
  forum_id: string;
  headline: string | null;
  type: 'post';
}

export interface SearchForumInput {
  query: string;
  type?: 'forums' | 'posts' | 'all';
  forumId?: string;
  page?: number;
  limit?: number;
}

export interface SearchForumResult {
  forums: ForumSearchResult[];
  posts: PostSearchResult[];
  totals: { forums: number; posts: number };
}

@Injectable()
export class SearchForumUseCase {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async execute(input: SearchForumInput): Promise<SearchForumResult> {
    const { query, type = 'all', forumId, page = 1, limit = 10 } = input;
    const offset = (page - 1) * limit;
    const tsquery = sanitizeTsQuery(query);
    if (!tsquery)
      return { forums: [], posts: [], totals: { forums: 0, posts: 0 } };

    const tasks: Array<Promise<unknown>> = [];
    if (type === 'all' || type === 'forums') {
      tasks.push(this.searchForums(tsquery, limit, offset));
    } else {
      tasks.push(
        Promise.resolve({
          rows: [],
          total: 0,
        }),
      );
    }
    if (type === 'all' || type === 'posts') {
      tasks.push(this.searchPosts(tsquery, forumId, limit, offset));
    } else {
      tasks.push(
        Promise.resolve({
          rows: [],
          total: 0,
        }),
      );
    }

    const [forumResult, postResult] = (await Promise.all(tasks)) as Array<{
      rows: Array<Record<string, unknown>>;
      total: number;
    }>;

    return {
      forums: forumResult.rows.map((r) => ({
        id: String(r.id),
        name: String(r.name),
        slug: String(r.slug),
        description: r.description ? String(r.description) : null,
        visibility: String(r.visibility) as ForumVisibility,
        headline: r.headline ? String(r.headline) : null,
        type: 'forum' as const,
      })),
      posts: postResult.rows.map((r) => ({
        id: String(r.id),
        post_id: String(r.id),
        title: String(r.title),
        forum_id: String(r.forum_id),
        headline: r.headline ? String(r.headline) : null,
        type: 'post' as const,
      })),
      totals: { forums: forumResult.total, posts: postResult.total },
    };
  }

  private async searchForums(
    tsquery: string,
    limit: number,
    offset: number,
  ): Promise<{ rows: Array<Record<string, unknown>>; total: number }> {
    const rows = await this.dataSource.query(
      `SELECT id, name, slug, description, visibility,
              ts_headline('simple', name || ' ' || coalesce(description, ''), plainto_tsquery('simple', $1), 'MaxWords=20') AS headline
       FROM forums
       WHERE search_vector @@ plainto_tsquery('simple', $1)
         AND visibility = 'public'
       ORDER BY ts_rank(search_vector, plainto_tsquery('simple', $1)) DESC
       LIMIT $2 OFFSET $3`,
      [tsquery, limit, offset],
    );
    const countResult = await this.dataSource.query(
      `SELECT COUNT(*)::int AS count FROM forums
       WHERE search_vector @@ plainto_tsquery('simple', $1) AND visibility = 'public'`,
      [tsquery],
    );
    return { rows, total: countResult[0]?.count ?? 0 };
  }

  private async searchPosts(
    tsquery: string,
    forumId: string | undefined,
    limit: number,
    offset: number,
  ): Promise<{ rows: Array<Record<string, unknown>>; total: number }> {
    const params: unknown[] = [tsquery];
    let forumJoin = '';
    let forumFilter = '';
    if (forumId) {
      params.push(forumId);
      forumFilter = ' AND p.forum_id = $2';
      forumJoin =
        " JOIN forums f ON p.forum_id = f.id AND f.visibility = 'public' ";
    } else {
      forumJoin =
        " JOIN forums f ON p.forum_id = f.id AND f.visibility = 'public' ";
    }
    const pageParamsIdx = forumId ? [3, 4] : [2, 3];
    params.push(limit, offset);
    const rows = await this.dataSource.query(
      `SELECT p.id, p.title, p.forum_id,
              ts_headline('simple', p.title, plainto_tsquery('simple', $1), 'MaxWords=20') AS headline
       FROM forum_posts p
       ${forumJoin}
       WHERE p.search_vector @@ plainto_tsquery('simple', $1)
         AND p.status = 'published'
         AND p.deleted_at IS NULL${forumFilter}
       ORDER BY ts_rank(p.search_vector, plainto_tsquery('simple', $1)) DESC
       LIMIT $${pageParamsIdx[0]} OFFSET $${pageParamsIdx[1]}`,
      params,
    );
    const countParams = forumId ? [tsquery, forumId] : [tsquery];
    const countQuery = forumId
      ? `SELECT COUNT(*)::int AS count FROM forum_posts p ${forumJoin} WHERE p.search_vector @@ plainto_tsquery('simple', $1) AND p.status = 'published' AND p.deleted_at IS NULL AND p.forum_id = $2`
      : `SELECT COUNT(*)::int AS count FROM forum_posts p ${forumJoin} WHERE p.search_vector @@ plainto_tsquery('simple', $1) AND p.status = 'published' AND p.deleted_at IS NULL`;
    const countResult = await this.dataSource.query(countQuery, countParams);
    return { rows, total: countResult[0]?.count ?? 0 };
  }
}

void (undefined as unknown as ForumVisibility);

function sanitizeTsQuery(query: string): string {
  return query.replace(/[()|&!:'\\]/g, ' ').slice(0, 200);
}
