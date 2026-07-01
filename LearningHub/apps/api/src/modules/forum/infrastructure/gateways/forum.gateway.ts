import type { Server, Socket } from 'socket.io';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
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
  implements
    OnGatewayInit,
    OnGatewayConnection,
    OnGatewayDisconnect,
    IForumGateway
{
  @WebSocketServer()
  server!: Server;

  constructor(private readonly jwt: JwtService) {}

  afterInit(server: Server): void {
    server.use((socket, next) => {
      try {
        const token = socket.handshake.auth?.token as string | undefined;
        if (!token) {
          return next(new Error('Missing token'));
        }
        const payload = this.jwt.verify(token) as { sub?: string };
        if (!payload.sub) {
          return next(new Error('Invalid token payload'));
        }
        (socket as AuthSocket).userId = payload.sub;
        next();
      } catch (err) {
        next(err instanceof Error ? err : new Error('Auth failed'));
      }
    });
  }

  handleConnection(client: AuthSocket): void {
    client.join(`user:${client.userId}`);
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

  emitCommentNew(forumId: string, postId: string, payload: unknown): void {
    this.server
      ?.to(`post:${postId}`)
      .to(`forum:${forumId}`)
      .emit('comment:new', payload);
  }

  emitReactionUpdate(forumId: string, postId: string, payload: unknown): void {
    this.server
      ?.to(`post:${postId}`)
      .to(`forum:${forumId}`)
      .emit('reaction:update', payload);
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
