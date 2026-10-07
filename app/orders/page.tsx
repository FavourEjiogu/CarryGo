'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AppShell } from '@/src/components/AppShell';
import { naira } from '@/src/lib/app-config';

export default function Orders() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [login, setLogin] = useState(false);
  const [payment, setPayment] = useState('');

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    setPayment(q.get('payment') || '');
    fetch('/api/tasks?mine=1').then(async (response) => {
      if (response.status === 401) { setLogin(true); return; }
      const json = await response.json();
      setTasks(json.tasks || []);
    });
  }, []);

  if (login) return <AppShell><main className="shell page-pad narrow"><div className="card success"><h2>Sign in to see your tasks.</h2><Link className="btn dark" href="/login">Sign in</Link></div></main></AppShell>;

  return <AppShell><main className="shell page-pad">
    <div className="page-top">
      <div><div className="eyebrow">ORDERS · YOUR TASKS</div><h1 className="app-title">Know where it <em>stands.</em></h1></div>
      <Link className="btn dark" href="/do">New task</Link>
    </div>
    {payment && <div className="note">Payment: {payment}</div>}
    <div className="task-list">
      {tasks.length ? tasks.map((task) => (
        <article className="card task" key={task.id}>
          <div><b>{task.title}</b><span>{task.pickup_location_text} → {task.destination_location_text}</span><div className="chips"><i>{task.status}</i><i>{task.delivery_mode}</i></div></div>
          <div className="task-action"><strong>{naira(task.proposed_runner_fee_kobo)}</strong><Link className="btn dark" href={'/orders/'+task.id}>Open</Link></div>
        </article>
      )) : (
        <div className="card success"><h2>No tasks yet.</h2><p className="lead">Post something small and watch the loop work.</p><Link className="btn dark" href="/do">Post a task</Link></div>
      )}
    </div>
  </main></AppShell>;
}
