'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
};

export function InstallPrompt() {
  const pathname = usePathname();
  const [event, setEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (pathname !== '/') return;
    const dismissed = localStorage.getItem('cg:install-nudge:v1') === '1';
    const standalone = window.matchMedia('(display-mode: standalone)').matches;
    if (dismissed || standalone) return;

    const onBeforeInstall = (value: Event) => {
      value.preventDefault();
      setEvent(value as BeforeInstallPromptEvent);
      window.setTimeout(() => setVisible(true), 2200);
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', onBeforeInstall);
  }, [pathname]);

  if (!visible || !event) return null;

  async function install() {
    const promptEvent = event;
    if (!promptEvent) return;
    await promptEvent.prompt();
    await promptEvent.userChoice.catch(() => null);
    localStorage.setItem('cg:install-nudge:v1', '1');
    setVisible(false);
    setEvent(null);
  }

  function dismiss() {
    localStorage.setItem('cg:install-nudge:v1', '1');
    setVisible(false);
    setEvent(null);
  }

  return (
    <aside className="install-nudge" aria-label="Install CarryGo">
      <div className="install-nudge-copy">
        <strong>Keep CarryGo one tap away.</strong>
        <span>Install it like an app for faster access.</span>
      </div>
      <div className="install-nudge-actions">
        <button type="button" className="btn ghost" onClick={dismiss}>Not now</button>
        <button type="button" className="btn dark" onClick={install}>Install</button>
      </div>
    </aside>
  );
}
