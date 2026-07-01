'use client';

import { useEffect, useRef } from 'react';

export function useExamLockdown(onSubmit: () => void) {
  const safeSubmitRef = useRef<() => void>(() => undefined);

  safeSubmitRef.current = onSubmit;

  useEffect(() => {
    history.pushState(null, '', location.href);

    const handlePopState = () => {
      history.pushState(null, '', location.href);
      safeSubmitRef.current();
    };
    const handleVisibilityChange = () => {
      if (document.hidden) safeSubmitRef.current();
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
      safeSubmitRef.current();
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
}
