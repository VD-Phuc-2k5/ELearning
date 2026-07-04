'use client';

import { useEffect, useRef } from 'react';
import type { Socket } from 'socket.io-client';
import { io } from 'socket.io-client';
import { getSocketToken } from '../../app/actions/auth.actions';

interface ForumSocketHandlers {
  onCommentNew?: (payload: unknown) => void;
  onCommentDeleted?: (payload: unknown) => void;
  onCommentUpdated?: (payload: unknown) => void;
  onReactionUpdate?: (payload: unknown) => void;
  onPollUpdate?: (payload: unknown) => void;
  onNotification?: (payload: unknown) => void;
  onPostNew?: (payload: unknown) => void;
  onPostHidden?: (payload: unknown) => void;
  onPostRestored?: (payload: unknown) => void;
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
  // Live ref so the async connect handler reads current room ids
  const roomsRef = useRef({ postId, forumId });
  roomsRef.current = { postId, forumId };

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;

    (async () => {
      const token = await getSocketToken();
      if (cancelled) return;

      const socketUrl = (
        process.env.NEXT_PUBLIC_NEST_API_URL ?? 'http://localhost:8080'
      ).replace(/\/api\/?$/, '');

      const socket = io(`${socketUrl}/forum`, {
        auth: { token },
        transports: ['websocket'],
        autoConnect: false,
      });

      // Register handlers before connect — Socket.IO queues them safely
      socket.on('comment:new', (p) => handlersRef.current?.onCommentNew?.(p));
      socket.on('comment:deleted', (p) =>
        handlersRef.current?.onCommentDeleted?.(p),
      );
      socket.on('comment:updated', (p) =>
        handlersRef.current?.onCommentUpdated?.(p),
      );
      socket.on('reaction:update', (p) =>
        handlersRef.current?.onReactionUpdate?.(p),
      );
      socket.on('poll:update', (p) => handlersRef.current?.onPollUpdate?.(p));
      socket.on('notification', (p) =>
        handlersRef.current?.onNotification?.(p),
      );
      socket.on('post:new', (p) => handlersRef.current?.onPostNew?.(p));
      socket.on('post:hidden', (p) => handlersRef.current?.onPostHidden?.(p));
      socket.on('post:restored', (p) =>
        handlersRef.current?.onPostRestored?.(p),
      );

      // Join rooms after connect — emit requires an active connection
      socket.on('connect', () => {
        const { postId: pid, forumId: fid } = roomsRef.current;
        if (pid) socket.emit('join:post', { postId: pid });
        if (fid) socket.emit('join:forum', { forumId: fid });
      });

      socketRef.current = socket;
      socket.connect();
    })();

    return () => {
      cancelled = true;
      const s = socketRef.current;
      if (s) {
        const { postId: pid, forumId: fid } = roomsRef.current;
        if (pid) s.emit('leave:post', { postId: pid });
        if (fid) s.emit('leave:forum', { forumId: fid });
        s.disconnect();
        socketRef.current = null;
      }
    };
  }, [enabled]);

  // Re-join new rooms when postId/forumId change after socket is already connected
  useEffect(() => {
    const s = socketRef.current;
    if (!s?.connected) return;
    if (postId) s.emit('join:post', { postId });
    if (forumId) s.emit('join:forum', { forumId });
  }, [postId, forumId]);

  return socketRef.current;
}
