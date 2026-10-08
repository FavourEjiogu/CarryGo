'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Icon } from '@/src/components/icons';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

export function PWAExperience() {
  const [online, setOnline] = useState(true);
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstall, setShowInstall] = useState(false);
  const [showUpdate, setShowUpdate] = useState(false);

  useEffect(() => {
    const refreshNetwork = () => setOnline(navigator.onLine);
    refreshNetwork();
    window.addEventListener('online', refreshNetwork);
    window.addEventListener('offline', refreshNetwork);

    const onInstall = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event as BeforeInstallPromptEvent);
      try {
        if (localStorage.getItem('cg:pwa-install-dismissed:v1') === '1') return;
      } catch {}
      window.setTimeout(() => setShowInstall(true), 12000);
    };

    const onUpdate = () => setShowUpdate(true);

    window.addEventListener('beforeinstallprompt', onInstall as EventListener);
    window.addEventListener('carrygo:sw-update', onUpdate as EventListener);

    return () => {
      window.removeEventListener('online', refreshNetwork);
      window.removeEventListener('offline', refreshNetwork);
      window.removeEventListener('beforeinstallprompt', onInstall as EventListener);
      window.removeEventListener('carrygo:sw-update', onUpdate as EventListener);
    };
  }, []);

  const install = async () => {
    if (!installEvent) return;
    const result = await installEvent.prompt();
    if (result.outcome === 'accepted') setShowInstall(false);
    setInstallEvent(null);
  };

  const dismissInstall = () => {
    try { localStorage.setItem('cg:pwa-install-dismissed:v1', '1'); } catch {}
    setShowInstall(false);
  };

  const update = () => {
    navigator.serviceWorker.getRegistration('/').then((registration) => {
      registration?.waiting?.postMessage({ type: 'SKIP_WAITING' });
    });
    setShowUpdate(false);
    window.setTimeout(() => window.location.reload(), 160);
  };

  return (
    <>
      <AnimatePresence>
        {!online && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} className="offline-toast" role="status">
            You’re offline · saved screens still work
          </motion.div>
        )}
        {showInstall && installEvent && (
          <motion.section initial={{ opacity: 0, y: 18, scale: .97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 18 }} className="pwa-install" aria-label="Install CarryGo">
            <b>Keep CarryGo one tap away.</b>
            <p>Install the campus app shell for a faster, more focused launch next time.</p>
            <div className="pwa-actions">
              <button type="button" className="btn ghost" onClick={dismissInstall}>Not now</button>
              <button type="button" className="btn dark" onClick={install}>Install <Icon name="arrow" size={15}/></button>
            </div>
          </motion.section>
        )}
        {showUpdate && (
          <motion.section initial={{ opacity: 0, y: 18, scale: .97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 18 }} className="pwa-update" aria-label="Update available">
            <b>A fresher CarryGo is ready.</b>
            <p>Update now to get the latest fixes without losing your place.</p>
            <div className="pwa-actions">
              <button type="button" className="btn ghost" onClick={() => setShowUpdate(false)}>Later</button>
              <button type="button" className="btn dark" onClick={update}>Update <Icon name="check" size={15}/></button>
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </>
  );
}
