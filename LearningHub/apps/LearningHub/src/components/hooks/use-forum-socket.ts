'use client';

import { useEffect, useRef } from 'react';
import type { Socket } from 'socket.io-client';
import { io } from 'socket.io-client';
import { refreshAccessToken } from '../../lib/api';

interface ForumSocketHandlers {
  onCommentNew?: (payload: unknown) => void;
  onReactionUpdate?: (payload: unknown) => void;
  onPollUpdate?: (payload: unknown) => void;
  onNotification?: (payload: unknown) => void;
  onPostNew?: (payload: unknown) => void;
}

interface UseForumSocketArgs {
  postId?: string;
  forumId?: string;
  enabled: boolean;
  handlers?: ForumSocketHandlers;
}

export function useForumSocket({
  postId,
  forumId,
  enabled,
  handlers,
}: UseForumSocketArgs): Socket | null {
  const socketRef = useRef<Socket | null>(null);
  const handlersRef = useRef<ForumSocketHandlers | undefined>(handlers);
  handlersRef.current = handlers;

  useEffect(() => {
    if (!enabled) return;
    const socketUrl = (
      process.env.NEXT_PUBLIC_NEST_API_URL ?? 'http://localhost:8080'
    ).replace(/\/api\/?$/, '');
    const socket = io(`${socketUrl}/forum`, {
      auth: (cb: (data: { token: string }) => void) => {
        const t =
          typeof window !== 'undefined'
            ? (localStorage.getItem('accessToken') ?? '')
            : '';
        cb({ token: t });
      },
      transports: ['websocket'],
      autoConnect: false,
    });
    socketRef.current = socket;
    socket.on('connect_error', (err: Error) => {
      if (err.message?.includes('jwt expired')) {
        refreshAccessToken().catch(() => undefined);
      }
    });
    const connectTimer = window.setTimeout(() => socket.connect(), 0);
    return () => {
      window.clearTimeout(connectTimer);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [enabled]);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;
    if (postId) {
      socket.emit('join:post', { postId });
    }
    if (forumId) {
      socket.emit('join:forum', { forumId });
    }
    const onCommentNew = (payload: unknown) =>
      handlersRef.current?.onCommentNew?.(payload);
    const onReactionUpdate = (payload: unknown) =>
      handlersRef.current?.onReactionUpdate?.(payload);
    const onPollUpdate = (payload: unknown) =>
      handlersRef.current?.onPollUpdate?.(payload);
    const onNotification = (payload: unknown) =>
      handlersRef.current?.onNotification?.(payload);
    const onPostNew = (payload: unknown) =>
      handlersRef.current?.onPostNew?.(payload);
    socket.on('comment:new', onCommentNew);
    socket.on('reaction:update', onReactionUpdate);
    socket.on('poll:update', onPollUpdate);
    socket.on('notification', onNotification);
    socket.on('post:new', onPostNew);

    return () => {
      if (postId) socket.emit('leave:post', { postId });
      if (forumId) socket.emit('leave:forum', { forumId });
      socket.off('comment:new', onCommentNew);
      socket.off('reaction:update', onReactionUpdate);
      socket.off('poll:update', onPollUpdate);
      socket.off('notification', onNotification);
      socket.off('post:new', onPostNew);
    };
  }, [postId, forumId]);

  return socketRef.current;
}
