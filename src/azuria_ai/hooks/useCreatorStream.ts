import { useEffect, useRef } from 'react';
import { ADMIN_UID_FRONT } from '../../config/admin';

export function useCreatorStream(onEvent: (ev: Record<string, unknown>) => void) {
  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    let closed = false;
    let retryTimer: NodeJS.Timeout | null = null;

    const connect = () => {
      const url = `/api/admin/creator/stream?admin_uid=${encodeURIComponent(ADMIN_UID_FRONT)}`;
      const sse = new EventSource(url, { withCredentials: true } as Record<string, unknown>);
      const handler = (ev: MessageEvent) => onEvent(JSON.parse(ev.data));
      sse.addEventListener('creator-alert', handler);
      sse.addEventListener('creator-insight', handler);
      sse.addEventListener('creator-recommendation', handler);
      sse.addEventListener('creator-roadmap', handler);
      sse.onerror = () => {
        sse.close();
        if (!closed) {
          retryTimer = setTimeout(connect, 3000); // fallback silencioso
        }
      };
      esRef.current = sse;
    };

    connect();

    return () => {
      closed = true;
      if (retryTimer) {clearTimeout(retryTimer);}
      esRef.current?.close();
      esRef.current = null;
    };
  }, [onEvent]);
}

