import { SetMetadata } from '@nestjs/common';
import type { ForumMemberRole } from '../../domain/entities/forum.domain';

export const FORUM_MINIMUM_ROLE_KEY = 'forumMinimumRole';

export const MinimumForumRole = (role: ForumMemberRole): MethodDecorator =>
  SetMetadata(FORUM_MINIMUM_ROLE_KEY, role);
