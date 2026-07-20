'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export function useExamLockdown(onSubmit: () => void) {
  const [pendingSubmit, setPendingSubmit] = useState(false);
  const submitRef = useRef(onSubmit);
  submitRef.current = onSubmit;

  const onConfirmSubmit = useCallback(() => {
    submitRef.current();
    setPendingSubmit(false);
  }, []);

  const onCancelSubmit = useCallback(() => {
    setPendingSubmit(false);
  }, []);

  useEffect(() => {
    history.pushState(null, '', location.href);

    const trigger = () => {
      setPendingSubmit(true);
    };

    const handlePopState = () => {
      history.pushState(null, '', location.href);
      trigger();
    };
    const handleVisibilityChange = () => {
      if (document.hidden) trigger();
    };
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    const handleClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest('a[href]');
      if (!anchor) return;
      const href = anchor.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('javascript:'))
        return;
      e.preventDefault();
      e.stopImmediatePropagation();
      trigger();
    };

    window.addEventListener('popstate', handlePopState);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('click', handleClick, true);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('click', handleClick, true);
    };
  }, []);

  return { pendingSubmit, onConfirmSubmit, onCancelSubmit };
}
