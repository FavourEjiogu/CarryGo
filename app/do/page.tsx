'use client';

import Link from 'next/link';
import { useState } from 'react';
import { AppShell } from '@/src/components/AppShell';
import { ROOM_PREMIUM_KOBO, discountedServiceFee, serviceFee } from '@/src/lib/fees';

const nairaToKobo = (value: string) =>
  Math.max(0, Math.round((Number(value.replace(/[^0-9.]/g, '')) || 0) * 100));

const naira = (kobo: number) => (kobo / 100).toLocaleString();
type DeliveryMode = 'MEET' | 'HOSTEL' | 'ROOM';

export default function DoPage() {
  const [step, setStep] = useState(1);
  const [task, setTask] = useState('');
  const [pickup, setPickup] = useState('Omega');
  const [drop, setDrop] = useState('Portfolio Hostel');
  const [room, setRoom] = useState('214');
  const [mode, setMode] = useState<DeliveryMode>('ROOM');
  const [when, setWhen] = useState('');
  const [item, setItem] = useState('2500');
  const [fee, setFee] = useState('500');
  const [bank, setBank] = useState(35);
  const [used, setUsed] = useState(0);
  const [posted, setPosted] = useState(false);

  const itemKobo = nairaToKobo(item);
  const feeKobo = nairaToKobo(fee);
  const roomPremium = mode === 'ROOM' ? ROOM_PREMIUM_KOBO : 0;
  const baseServiceFee = serviceFee(feeKobo);
  const discountedFee = discountedServiceFee(baseServiceFee, used);
  const estimatedFunding = itemKobo + feeKobo + roomPremium + discountedFee;

  return (
    <AppShell>
      <main className="shell page-pad">
        <div className="pill">NEW TASK · BINGHAM KARU</div>
        <h1>What should we <em>carry?</em></h1>
        <p className="lead">
          Type pickup and drop exactly how you normally describe them. The runner can message you to confirm before moving.
        </p>

        {!posted ? (
          <div className="card form">
            <div className="wizard">
              {['Task', 'Where + when', 'Delivery', 'Review'].map((label, index) => (
                <span className={step > index ? 'on' : ''} key={label}>{label}</span>
              ))}
            </div>

            {step === 1 && (
              <>
                <label>
                  What do you need?
                  <textarea
                    value={task}
                    onChange={(event) => setTask(event.target.value)}
                    placeholder="e.g. Buy lunch from Omega and bring it to Portfolio 214"
                  />
                </label>
                <div className="grid2">
                  <label>
                    Item estimate
                    <input value={item} onChange={(event) => setItem(event.target.value)} inputMode="numeric" />
                  </label>
                  <label>
                    Opening runner fee
                    <input value={fee} onChange={(event) => setFee(event.target.value)} inputMode="numeric" />
                  </label>
                </div>
                <button className="btn dark full" onClick={() => setStep(2)}>Continue →</button>
              </>
            )}

            {step === 2 && (
              <>
                <div className="grid2">
                  <label>
                    Pickup
                    <input value={pickup} onChange={(event) => setPickup(event.target.value)} placeholder="Omega" />
                  </label>
                  <label>
                    Drop
                    <input value={drop} onChange={(event) => setDrop(event.target.value)} placeholder="Portfolio Hostel" />
                  </label>
                </div>
                <label>
                  When?
                  <input type="datetime-local" value={when} onChange={(event) => setWhen(event.target.value)} />
                  <small className="hint">Leave blank for as soon as possible.</small>
                </label>
                <div className="actions">
                  <button className="btn ghost" onClick={() => setStep(1)}>← Back</button>
                  <button className="btn dark" onClick={() => setStep(3)}>Continue →</button>
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <label>Delivery</label>
                <div className="choice-grid">
                  {([
                    ['MEET', 'Meet-up', 'Landmark / point you choose'],
                    ['HOSTEL', 'Hostel delivery', 'Normal hostel drop · any eligible runner'],
                    ['ROOM', 'Room delivery', 'Same gender only · higher delivery fee'],
                  ] as const).map(([value, title, description]) => (
                    <button
                      key={value}
                      type="button"
                      className={mode === value ? 'choice on' : 'choice'}
                      onClick={() => setMode(value)}
                    >
                      <b>{title}</b>
                      <span>{description}</span>
                    </button>
                  ))}
                </div>

                {mode === 'ROOM' && (
                  <>
                    <label>
                      Room
                      <input value={room} onChange={(event) => setRoom(event.target.value)} placeholder="214" />
                    </label>
                    <div className="note">
                      Room delivery is always same-gender and has a higher delivery premium than normal hostel delivery.
                    </div>
                  </>
                )}

                {mode === 'HOSTEL' && (
                  <div className="note">Normal hostel delivery can use any eligible runner.</div>
                )}

                <div className="actions">
                  <button className="btn ghost" onClick={() => setStep(2)}>← Back</button>
                  <button className="btn dark" onClick={() => setStep(4)}>Review →</button>
                </div>
              </>
            )}

            {step === 4 && (
              <>
                <div className="review">
                  <b>{task || 'Buy and bring my item'}</b>
                  <span>{pickup} → {drop}{mode === 'ROOM' ? ` · room ${room}` : ''}</span>
                  <span>{when ? `Scheduled · ${when}` : 'As soon as possible'}</span>
                  <span>Runner fee · ₦{naira(feeKobo)}</span>
                  <span>Room premium · {roomPremium ? `₦${naira(roomPremium)}` : '—'}</span>
                  <span>CarryGo service · ₦{naira(baseServiceFee)} → ₦{naira(discountedFee)}</span>
                </div>

                <label>
                  Spend streak discount
                  <div className="discount-line">
                    <input
                      type="range"
                      min="0"
                      max={bank}
                      step="5"
                      value={used}
                      onChange={(event) => setUsed(Number(event.target.value))}
                    />
                    <b>{used}%</b>
                  </div>
                  <small className="hint">{bank - used}% stays banked. Use any portion now.</small>
                </label>

                <div className="total">
                  <small>Estimated funding</small>
                  <b>₦{naira(estimatedFunding)}</b>
                  <small>Item capital + runner fee + room premium + discounted CarryGo fee.</small>
                </div>

                <div className="actions">
                  <button className="btn ghost" onClick={() => setStep(3)}>← Back</button>
                  <button
                    className="btn dark"
                    onClick={() => {
                      setBank((value) => Math.max(0, value - used));
                      setPosted(true);
                    }}
                  >
                    Post task →
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="card success">
            <div className="success-icon">✓</div>
            <h2>Task is live.</h2>
            <p>
              Offers will include both price and time. The runner can confirm your typed location in chat before moving.
            </p>
            <div className="review">
              <span>{pickup} → {drop}{mode === 'ROOM' ? ` · room ${room}` : ''}</span>
              <span>₦{naira(feeKobo)} runner fee</span>
              <span>
                {mode === 'ROOM' ? 'Same-gender room delivery' : mode === 'HOSTEL' ? 'Normal hostel delivery' : 'Meet-up delivery'}
              </span>
            </div>
            <div className="actions">
              <Link className="btn dark" href="/orders/demo-1001">Track task</Link>
              <Link className="btn ghost" href="/earn">See runner offers</Link>
            </div>
          </div>
        )}
      </main>
    </AppShell>
  );
}
