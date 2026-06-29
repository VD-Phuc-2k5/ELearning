import type { Server, Socket } from 'socket.io';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { IForumGateway } from '../../application/interfaces/i-forum-gateway';

interface AuthSocket extends Socket {
  userId?: string;
}

@WebSocketGateway({
  namespace: 'forum',
  cors: { origin: true, credentials: true },
})
export class ForumGateway
  implements OnGatewayConnection, OnGatewayDisconnect, IForumGateway
{
  private readonly logger = new Logger(ForumGateway.name);

  @WebSocketServer()
  server!: Server;

  constructor(private readonly jwt: JwtService) {}

  async handleConnection(client: AuthSocket): Promise<void> {
    try {
      const token = client.handshake.auth?.token as string | undefined;
      if (!token) {
        client.disconnect(true);
        return;
      }
      const payload = this.jwt.verify(token) as { sub?: string };
      if (!payload.sub) {
        client.disconnect(true);
        return;
      }
      client.userId = payload.sub;
      client.join(`user:${client.userId}`);
    } catch (err) {
      this.logger.warn(`Socket auth failed: ${(err as Error).message}`);
      client.disconnect(true);
    }
  }

  handleDisconnect(client: AuthSocket): void {
    if (client.userId) {
      client.leave(`user:${client.userId}`);
    }
  }

  @SubscribeMessage('join:forum')
  handleJoinForum(
    @MessageBody() data: { forumId: string },
    @ConnectedSocket() client: AuthSocket,
  ): { ok: true } {
    if (data.forumId) client.join(`forum:${data.forumId}`);
    return { ok: true };
  }

  @SubscribeMessage('leave:forum')
  handleLeaveForum(
    @MessageBody() data: { forumId: string },
    @ConnectedSocket() client: AuthSocket,
  ): { ok: true } {
    if (data.forumId) client.leave(`forum:${data.forumId}`);
    return { ok: true };
  }

  @SubscribeMessage('join:post')
  handleJoinPost(
    @MessageBody() data: { postId: string },
    @ConnectedSocket() client: AuthSocket,
  ): { ok: true } {
    if (data.postId) client.join(`post:${data.postId}`);
    return { ok: true };
  }

  @SubscribeMessage('leave:post')
  handleLeavePost(
    @MessageBody() data: { postId: string },
    @ConnectedSocket() client: AuthSocket,
  ): { ok: true } {
    if (data.postId) client.leave(`post:${data.postId}`);
    return { ok: true };
  }

  emitPostNew(forumId: string, payload: unknown): void {
    this.server?.to(`forum:${forumId}`).emit('post:new', payload);
  }

  emitCommentNew(postId: string, payload: unknown): void {
    this.server?.to(`post:${postId}`).emit('comment:new', payload);
  }

  emitReactionUpdate(postId: string, payload: unknown): void {
    this.server?.to(`post:${postId}`).emit('reaction:update', payload);
  }

  emitPollUpdate(postId: string, payload: unknown): void {
    this.server?.to(`post:${postId}`).emit('poll:update', payload);
  }

  emitPostHidden(forumId: string, payload: unknown): void {
    this.server?.to(`forum:${forumId}`).emit('post:hidden', payload);
  }

  emitPostRestored(forumId: string, payload: unknown): void {
    this.server?.to(`forum:${forumId}`).emit('post:restored', payload);
  }

  emitNotification(userId: string, payload: unknown): void {
    this.server?.to(`user:${userId}`).emit('notification', payload);
  }
}
