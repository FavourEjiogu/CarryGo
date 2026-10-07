'use client';

import { useMemo, useState } from 'react';
import { AppShell } from '@/src/components/AppShell';
import { binghamAcademicUnits, departmentsForFaculty } from '@/src/lib/bingham-academics';

export default function Profile() {
  const [faculty, setFaculty] = useState<string>('Faculty of Computing Science');
  const [department, setDepartment] = useState('Cyber Security');
  const departments = useMemo(() => departmentsForFaculty(faculty), [faculty]);

  return (
    <AppShell>
      <main className="shell page-pad narrow">
        <div className="pill">CAMPUS PROFILE</div>
        <h1>Just enough <em>identity.</em></h1>
        <p className="lead">MVP uses email + phone. Faculty, department and gender support campus-specific matching and challenges.</p>
        <div className="card form">
          <label>Name<input placeholder="Your name"/></label>
          <div className="grid2">
            <label>Email<input type="email"/></label>
            <label>Phone<input type="tel"/></label>
          </div>
          <label>
            Faculty / college
            <select value={faculty} onChange={(event) => { setFaculty(event.target.value); setDepartment(''); }}>
              {binghamAcademicUnits.map(([name]) => <option key={name}>{name}</option>)}
            </select>
          </label>
          <label>
            Department
            <select value={department} onChange={(event) => setDepartment(event.target.value)}>
              <option value="">Select</option>
              {departments.map((value) => <option key={value}>{value}</option>)}
            </select>
          </label>
          <label>
            Gender
            <select defaultValue="UNSPECIFIED">
              <option value="UNSPECIFIED">Prefer not to say</option>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
            </select>
          </label>
          <button className="btn dark full">Save profile</button>
        </div>
      </main>
    </AppShell>
  );
}
