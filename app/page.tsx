'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { AppShell } from '@/src/components/AppShell';
import { Icon } from '@/src/components/icons';
import { MouseFollowingEyes } from '@/components/ui/mouse-following-eyes';
import { Tour, useTour, type TourStep } from '@/components/ui/product-tour';

type Dashboard = {
  authenticated: boolean;
  profile?: { display_name?: string } | null;
  campus?: { name: string; city?: string | null; state?: string | null } | null;
  streak?: { current_weeks?: number; discount_percent?: number } | null;
  openTaskCount?: number;
  tasks?: Array<{
    id: string;
    title: string;
    status: string;
    pickup_location_text: string;
    destination_location_text: string;
  }>;
};

const steps = [
  ['01', 'POST', 'Tell CarryGo what needs doing.'],
  ['02', 'AGREE', 'Choose the runner, price and timing.'],
  ['03', 'MOVE', 'Follow it through to handoff.'],
] as const;

const TOUR_STEPS: TourStep[] = [
  {
    title: 'Welcome to CarryGo',
    content:
      'A campus-first way to get errands done or earn by helping nearby. This quick tour shows what each part of the app is for. You can close it any time.',
    placement: 'center',
  },
  {
    target: '#tour-do',
    title: 'Need something done?',
    content:
      'Start here to post a task. Describe what you need, set pickup and drop-off, review the estimate, then compare runner offers before agreeing. You stay in control of the agreement.',
    placement: 'bottom',
  },
  {
    target: '#tour-earn',
    title: 'Want to earn?',
    content:
      'Explore tasks around your campus, review the request details, and send an offer that fits your availability. Only start work after the task is funded.',
    placement: 'bottom',
  },
  {
    target: '#tour-how',
    title: 'Every task follows three moves',
    content:
      'Post the request, agree on the runner and price, then follow the delivery through to handoff. Changes that affect cost need approval; the handoff code is used to confirm completion.',
    placement: 'top',
  },
];

export default function Home() {
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const tour = useTour('cg:tour:v2');

  useEffect(() => {
    if (tour.seen()) return;
    const timer = window.setTimeout(() => tour.start(), 1200);
    return () => window.clearTimeout(timer);
  }, [tour.seen, tour.start]);

  useEffect(() => {
    fetch('/api/dashboard', { cache: 'no-store' })
      .then(async (response) =>
        response.status === 401
          ? { authenticated: false }
          : response.ok
            ? response.json()
            : { authenticated: false },
      )
      .then(setDashboard)
      .catch(() => setDashboard({ authenticated: false }));
  }, []);

  const firstName = useMemo(
    () => dashboard?.profile?.display_name?.trim().split(/\s+/)[0] || 'there',
    [dashboard],
  );
  const campusLabel = dashboard?.campus?.name
    ? dashboard.campus.city
      ? dashboard.campus.name + ' · ' + dashboard.campus.city
      : dashboard.campus.name
    : 'Your campus';
  const currentTask = dashboard?.tasks?.[0];
  const openTaskCount = dashboard?.openTaskCount || 0;

  return (
    <AppShell>
      <main className="shell app-page home-modern">
        <section className="home-landing-hero">
          <div className="home-landing-copy">
            <div className="eyebrow">
              {dashboard?.authenticated ? campusLabel.toUpperCase() : 'CAMPUS SERVICES'}
            </div>
            <h1>
              {dashboard?.authenticated ? (
                <>Good to see you, <em>{firstName}.</em></>
              ) : (
                <>Get things done.<br /><em>Keep moving.</em></>
              )}
            </h1>
            <p className="home-lead">
              Need something picked up, bought, delivered or handled nearby? Post it here. A runner takes it from there.
            </p>
            <div className="home-cta">
              <Link id="tour-do" href="/do" className="btn dark energy-border">
                I need something <Icon name="arrow" size={17} />
              </Link>
              <Link id="tour-earn" href="/earn" className="btn ghost">
                I want to earn
              </Link>
            </div>
            {dashboard?.authenticated && (
              <div className="home-context">
                <span><b>{openTaskCount}</b> open request{openTaskCount === 1 ? '' : 's'}</span>
                <span><b>{dashboard.streak?.current_weeks || 0}</b> week streak</span>
              </div>
            )}
          </div>

          <div className="home-landing-visual">
            <div className="home-visual-top"><span>GET / DONE</span><span>01—03</span></div>
            <MouseFollowingEyes className="home-eyes" />
            <div className="home-visual-copy">
              <small>THE SIMPLE LOOP</small>
              <strong>Post.<br />Agree.<br /><em>Move.</em></strong>
            </div>
            <div className="home-visual-note">
              <span className="brand-dot" /> Built around the way your campus actually works.
            </div>
          </div>
        </section>

        <section className="home-action-grid" aria-label="Start with CarryGo">
          <Link href="/do" className="home-action-card home-action-primary energy-border">
            <div><span className="action-index">01</span><Icon name="arrow" size={18} /></div>
            <small>I NEED SOMETHING</small>
            <h2>Post a task.</h2>
            <p>Describe it in your own words. Agree on the details before anything moves.</p>
          </Link>
          <Link href="/earn" className="home-action-card">
            <div><span className="action-index">02</span><Icon name="arrow" size={18} /></div>
            <small>I WANT TO EARN</small>
            <h2>Take a task.</h2>
            <p>See what people around your campus need and choose work that fits you.</p>
          </Link>
        </section>

        <section className="home-process" id="tour-how" aria-label="How CarryGo works">
          <div className="section-label">
            <span>HOW IT WORKS</span>
            <button
              className="text-link"
              type="button"
              onClick={tour.start}
              aria-label="Replay the CarryGo quick tour"
            >
              Replay quick tour ↗
            </button>
          </div>
          <div className="home-process-grid">
            {steps.map(([number, heading, copy]) => (
              <motion.article
                key={number}
                className="home-process-step"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: Number(number) * 0.04 }}
              >
                <span>{number}</span><b>{heading}</b><p>{copy}</p>
              </motion.article>
            ))}
          </div>
        </section>

        {dashboard?.authenticated && (
          <section className="home-grid home-status-grid">
            <div className="panel">
              <div className="panel-head"><span>YOUR CAMPUS</span><Link href="/campus">Open</Link></div>
              <h2>{campusLabel}</h2>
              <p>Places, requests and people are kept in your campus context.</p>
              <Link className="text-link" href="/campus">Explore your campus →</Link>
            </div>
            <div className="panel">
              <div className="panel-head"><span>YOUR NEXT MOVE</span><Link href="/orders">Orders</Link></div>
              <h2>{currentTask?.title || 'Nothing waiting.'}</h2>
              <p>
                {currentTask
                  ? currentTask.pickup_location_text + ' → ' + currentTask.destination_location_text
                  : 'Post a task or pick one up when you are ready.'}
              </p>
              {currentTask && <Link className="text-link" href={'/orders/' + currentTask.id}>Open task →</Link>}
            </div>
          </section>
        )}

        {dashboard?.tasks?.length ? (
          <section className="section-tight">
            <div className="section-label"><span>YOUR CURRENT TASKS</span><Link href="/orders">View all</Link></div>
            <div className="task-list compact">
              {dashboard.tasks.map((task) => (
                <Link href={'/orders/' + task.id} className="task-row" key={task.id}>
                  <div><b>{task.title}</b><span>{task.pickup_location_text} → {task.destination_location_text}</span></div>
                  <strong>{task.status.replaceAll('_', ' ')}</strong>
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        {!dashboard?.authenticated && (
          <section className="home-reassurance energy-border">
            <div>
              <small>NEW HERE?</small>
              <h2>Start with your campus.</h2>
              <p>Choose your school during sign-up, then CarryGo keeps the experience centred on your local context.</p>
            </div>
            <Link className="btn dark" href="/login?mode=signup">
              Create account <Icon name="arrow" size={16} />
            </Link>
          </section>
        )}
      </main>
      <Tour
        steps={TOUR_STEPS}
        open={tour.open}
        onOpenChange={tour.setOpen}
        onFinish={tour.markSeen}
        onSkip={tour.markSeen}
      />
    </AppShell>
  );
}
