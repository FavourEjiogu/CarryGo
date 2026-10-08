'use client';

import { useEffect } from 'react';

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    let cancelled = false;

    void navigator.serviceWorker.register('/sw.js').then((registration) => {
      if (cancelled) return;

      const announceUpdate = () => {
        if (!navigator.serviceWorker.controller) return;
        window.dispatchEvent(new Event('carrygo:sw-update'));
      };

      if (registration.waiting) announceUpdate();

      registration.addEventListener('updatefound', () => {
        const worker = registration.installing;
        if (!worker) return;

        worker.addEventListener('statechange', () => {
          if (worker.state === 'installed') announceUpdate();
        });
      });

      void registration.update();
    }).catch(() => {
      // Service-worker failure should never block the application shell.
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
