'use client';

import { useEffect, useRef } from 'react';
import type { Socket } from 'socket.io-client';
import { io } from 'socket.io-client';

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

  useEffect(() => {
    if (!enabled) return;
    const token =
      typeof window !== 'undefined'
        ? localStorage.getItem('accessToken')
        : null;
    const socketUrl = (
      process.env.NEXT_PUBLIC_NEST_API_URL ?? 'http://localhost:8080'
    ).replace(/\/api\/?$/, '');
    const socket = io(`${socketUrl}/forum`, {
      auth: { token: token ?? '' },
      transports: ['websocket'],
      autoConnect: false,
    });
    const connectTimer = window.setTimeout(() => socket.connect(), 0);
    socketRef.current = socket;
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
      handlers?.onCommentNew?.(payload);
    const onReactionUpdate = (payload: unknown) =>
      handlers?.onReactionUpdate?.(payload);
    const onPollUpdate = (payload: unknown) =>
      handlers?.onPollUpdate?.(payload);
    const onNotification = (payload: unknown) =>
      handlers?.onNotification?.(payload);
    const onPostNew = (payload: unknown) => handlers?.onPostNew?.(payload);
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
  }, [postId, forumId, handlers]);

  return socketRef.current;
}
