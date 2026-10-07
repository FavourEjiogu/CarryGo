'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { AppShell } from '@/src/components/AppShell';
import { shouldSendPoint, type TrackingPoint } from '@/src/lib/tracking';

const path = [{ x: 30, y: 59 }, { x: 37, y: 56 }, { x: 45, y: 52 }, { x: 53, y: 55 }, { x: 62, y: 57 }];

export default function TrackPage() {
  const [locationState, setLocationState] = useState<'starting'|'live'|'denied'>('starting');
  const [tick, setTick] = useState(0);
  const [last, setLast] = useState<TrackingPoint | null>(null);
  const [updates, setUpdates] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((value) => value + 1), 3000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationState('denied');
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const next: TrackingPoint = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracyM: position.coords.accuracy,
          capturedAt: new Date().toISOString(),
          sequence: (last?.sequence ?? 0) + 1,
        };
        if (shouldSendPoint(last, next)) {
          setLast(next);
          setUpdates((value) => value + 1);
          setLocationState('live');
        }
      },
      () => setLocationState('denied'),
      { enableHighAccuracy: true, maximumAge: 15000, timeout: 12000 },
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [last]);

  const node = path[tick % path.length];

  return (
    <AppShell>
      <main className="shell page-pad">
        <div className="pill">ACTIVE DELIVERY · CG-1001</div>
        <div className="split-head">
          <div>
            <h1>Omega → <em>Portfolio 214</em></h1>
            <p className="lead">Same-gender room delivery · runner @chisom</p>
          </div>
          <span className="live">● {locationState === 'live' ? 'TRACKING LIVE' : locationState === 'denied' ? 'LOCATION UNAVAILABLE' : 'STARTING TRACKING'}</span>
        </div>

        <div className="track-grid card">
          <div className="tracking-map">
            <div className="road r1" />
            <div className="road r2" />
            <div className="track-user" style={{ left: '70%', top: '58%' }}>U</div>
            <div className="track-runner" style={{ left: node.x + '%', top: node.y + '%' }}>R</div>
            <span className="map-tag">Runner moving · live task</span>
          </div>
          <div className="track-side">
            <div><small>ETA</small><b>8 min</b><span>640 m remaining</span></div>
            <div><small>RUNNER LOCATION</small><b>Live</b><span>Latest participant position</span></div>
            <div><small>YOUR LOCATION</small><b>{locationState === 'live' ? 'Live' : 'Permission needed'}</b><span>{last ? `±${Math.round(last.accuracyM ?? 0)} m accuracy` : 'Active-delivery location sharing'}</span></div>
            {updates > 0 && <div className="note">{updates} compact location update{updates === 1 ? '' : 's'} captured. Weak-network buffering is enabled.</div>}
            {locationState === 'denied' && <div className="note">Location permission is unavailable. The delivery can continue with typed locations, chat confirmation and manual checkpoints.</div>}
          </div>
        </div>

        <div className="timeline">
          {[['09:58','Funded'],['10:02','Pickup confirmed'],['10:05','At vendor'],['—','En route'],['—','Handoff'],['—','Completed']].map(([time,label], index) => (
            <div className={index < 3 ? 'on' : ''} key={time + label}><small>{time}</small><b>{label}</b></div>
          ))}
        </div>

        <div className="grid3">
          <div className="card feature"><small>TRACKING</small><h3>Active-session only.</h3><p>Both sides share their latest location only while this delivery is active. No permanent campus surveillance.</p></div>
          <div className="card feature"><small>2G MODE</small><h3>Location ≠ map tiles.</h3><p>GPS points and task status continue to work without downloading a heavy map.</p></div>
          <div className="card feature"><small>ANALYTICS</small><h3>Every loop teaches us.</h3><p>Milestone timestamps feed route averages, p50/p90 travel times and total task-loop time.</p></div>
        </div>

        <Link className="btn ghost" href="/orders">← Orders</Link>
      </main>
    </AppShell>
  );
}
