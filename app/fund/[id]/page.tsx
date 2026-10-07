'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { AppShell } from '@/src/components/AppShell';
import { applyDiscount, naira, serviceFee } from '@/src/lib/app-config';

export default function Fund() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [task, setTask] = useState<any>(null);
  const [bank, setBank] = useState(0);
  const [wallet, setWallet] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [handoffPin, setHandoffPin] = useState('');
  const [topup, setTopup] = useState(false);

  useEffect(() => {
    setTopup(new URLSearchParams(window.location.search).get('topup') === '1');
    Promise.all([
      fetch('/api/tasks/' + id).then((r) => r.json()),
      fetch('/api/me').then((r) => r.json()),
    ]).then(([taskResponse, me]) => {
      setTask(taskResponse.task);
      setBank(Number(me.streak?.discount_percent || 0));
      setWallet(Number(me.wallet?.available_kobo || 0));
    }).catch(() => setError('Could not load funding details.'));
  }, [id]);

  const calc = useMemo(() => {
    const agreement = Array.isArray(task?.agreement) ? task.agreement[0] : task?.agreement;
    const item = Number(agreement?.item_budget_kobo || 0);
    const runner = Number(agreement?.runner_fee_kobo || 0);
    const premium = Number(task?.same_gender_premium_kobo || 0);
    const base = serviceFee(Math.max(0, runner - premium));
    const after = applyDiscount(base, discount);
    return { item, runner, base, after, total: item + runner + premium + after };
  }, [task, discount]);

  async function fund() {
    setBusy(true);
    setError('');

    if (topup) {
      const adjustmentResponse = await fetch('/api/tasks/' + id + '/price-adjustment');
      const adjustmentJson = await adjustmentResponse.json();
      const adjustment = (adjustmentJson.adjustments || []).find((entry: any) => entry.status === 'APPROVED');

      if (!adjustment) {
        setBusy(false);
        setError('Approved price adjustment not found.');
        return;
      }

      const response = await fetch('/api/tasks/' + id + '/price-adjustment/fund', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ adjustment_id: adjustment.id }),
      });
      const json = await response.json();
      setBusy(false);

      if (!response.ok) {
        setError(json.error || 'Could not fund the difference.');
        return;
      }

      router.push('/orders/' + id);
      return;
    }

    const response = await fetch('/api/tasks/' + id + '/fund', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ discount_percent: discount, handoff_pin: pin }),
    });
    const json = await response.json();
    setBusy(false);

    if (!response.ok) {
      setError(json.error || 'Could not fund task.');
      return;
    }

    const pinResponse = await fetch('/api/tasks/' + id + '/handoff', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ action: 'rotate' }),
    });
    const pinJson = await pinResponse.json();
    setHandoffPin(pinJson.pin || pin);
    setDone(true);
  }

  if (!task) return <AppShell><main className="shell app-page"><div className="card form"><h2>Loading funding…</h2></div></main></AppShell>;

  if (done) return <AppShell><main className="shell app-page narrow"><div className="card success">
    <div className="eyebrow">FUNDED</div>
    <h2>Money is locked. The runner can go.</h2>
    <p className="sub">Keep the handoff code private. Give it to the runner only when the delivery reaches you.</p>
    <div className="pin-display"><small>HANDOFF CODE</small><strong>{handoffPin}</strong></div>
    <div className="actions"><Link className="btn dark" href={'/orders/'+id}>Open task</Link><Link className="btn ghost" href="/orders">Orders</Link></div>
  </div></main></AppShell>;

  const ready = !topup && wallet >= calc.total && pin.length === 6;
  return <AppShell><main className="shell app-page narrow">
    <div className="page-top"><div><div className="eyebrow">{topup ? 'PRICE ADJUSTMENT' : 'FUND TASK'}</div><h1 className="app-title">{topup ? 'Close the price gap.' : 'Lock it. Then go.'}</h1><p className="sub">{topup ? 'Only the approved difference needs to be funded.' : 'Agreement first. Wallet funding second. Execution third.'}</p></div></div>
    <div className="card form">
      <div className="review">
        <b>{task.title}</b>
        <span>{task.pickup_location_text} → {task.destination_location_text}{task.delivery_mode === 'ROOM' ? ' · same-gender room ' + task.delivery_room : ''}</span>
        {!topup && <><span>Item capital · {naira(calc.item)}</span><span>Runner compensation · {naira(calc.runner + (task.same_gender_premium_kobo || 0))}</span><span>CarryGo fee · {naira(calc.base)} → {naira(calc.after)}</span></>}
      </div>

      {!topup && <>
        <label>Streak discount · {bank}% banked
          <div className="discount-line"><input type="range" min="0" max={bank} step="5" value={discount} onChange={(e) => setDiscount(Number(e.target.value))}/><b>{discount}%</b></div>
          <small className="hint">{bank-discount}% remains banked.</small>
        </label>
        <label>Handoff PIN
          <div className="grid2"><input className="pin-box" inputMode="numeric" maxLength={6} value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="6 digits"/><div className="soft-note">The runner sees no PIN. You give it to them at handoff.</div></div>
        </label>
        <div className="balance-line"><span>Wallet available</span><b>{naira(wallet)}</b></div>
        <div className="total"><small>Total needed</small><b>{naira(calc.total)}</b></div>
        {wallet < calc.total && <Link className="btn ghost full" href="/wallet">Add money to wallet</Link>}
      </>}

      {topup && <>
        <div className="soft-note">Your original escrow stays locked. Only the approved difference is drawn from the wallet.</div>
        <div className="balance-line"><span>Wallet available</span><b>{naira(wallet)}</b></div>
      </>}

      {error && <div className="error">{error}</div>}
      <button className="btn dark full" disabled={busy || !ready} onClick={fund}>{busy ? 'Securing funds…' : topup ? 'Fund approved difference' : 'Fund from wallet'}</button>
    </div>
  </main></AppShell>;
}
