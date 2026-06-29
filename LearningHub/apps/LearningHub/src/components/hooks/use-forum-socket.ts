'use client';

import { useEffect, useRef } from 'react';
import type { Socket } from 'socket.io-client';
import { io } from 'socket.io-client';

interface ForumSocketHandlers {
  onCommentNew?: (payload: unknown) => void;
  onReactionUpdate?: (payload: unknown) => void;
  onPollUpdate?: (payload: unknown) => void;
  onNotification?: (payload: unknown) => void;
}

interface UseForumSocketArgs {
  postId?: string;
  enabled: boolean;
  handlers?: ForumSocketHandlers;
}

export function useForumSocket({
  postId,
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
    const socket = io('/forum', {
      auth: { token: token ?? '' },
      transports: ['websocket'],
      autoConnect: true,
    });
    socketRef.current = socket;
    return () => {
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
    const onCommentNew = (payload: unknown) =>
      handlers?.onCommentNew?.(payload);
    const onReactionUpdate = (payload: unknown) =>
      handlers?.onReactionUpdate?.(payload);
    const onPollUpdate = (payload: unknown) =>
      handlers?.onPollUpdate?.(payload);
    const onNotification = (payload: unknown) =>
      handlers?.onNotification?.(payload);
    socket.on('comment:new', onCommentNew);
    socket.on('reaction:update', onReactionUpdate);
    socket.on('poll:update', onPollUpdate);
    socket.on('notification', onNotification);

    return () => {
      if (postId) socket.emit('leave:post', { postId });
      socket.off('comment:new', onCommentNew);
      socket.off('reaction:update', onReactionUpdate);
      socket.off('poll:update', onPollUpdate);
      socket.off('notification', onNotification);
    };
  }, [postId, handlers]);

  return socketRef.current;
}
