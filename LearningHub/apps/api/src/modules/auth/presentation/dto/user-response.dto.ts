import { User } from '../../domain/entities/user.entity';

export interface UserResponse {
  id: string;
  email: string;
  username: string;
  avatarUrl: string;
  isActive: boolean;
  createdAt: Date;
}

export function toUserResponse(user: User): UserResponse {
  return {
    id: user.id,
    email: user.email,
    username: user.username,
    avatarUrl: user.avatarUrl,
    isActive: user.isActive,
    createdAt: user.createdAt,
  };
}
