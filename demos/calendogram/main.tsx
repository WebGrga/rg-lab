// Calendogram lab demo entry: the real app, signed in as a demo visitor, with sample data.
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '../src/diagnostics.ts';
import { App } from '../src/App.tsx';
import { getLang, translate } from '../src/i18n.ts';
import { seedDefaultLegend, adoptDevice } from '../src/session.ts';
import { db, newContact, newLocation, newTask, saveMany } from '../src/db.ts';
import { createExampleProject } from '../src/projects.ts';
import { addDays, todayISO } from '../src/dates.ts';
import type { Data } from '../src/data.ts';
import type { AnyRecord, Kind } from '../shared/types.ts';
import { DEMO_USER } from './api.ts';
import '../src/styles.css';
import './demo.css';

async function seedSample() {
  if ((await db.tasks.count()) > 0) return;
  await createExampleProject({ contacts: [] } as unknown as Data, translate);
  const today = todayISO();
  const day = (n: number) => addDays(today, n);
  const ana = { ...newContact('Ana Kovač'), company: 'Architect' };
  const tom = { ...newContact('Tom Barić'), company: 'Plumbing' };
  const lea = { ...newContact('Lea Novak'), company: 'Client' };
  const flats = { ...newLocation('Riverside flats'), address: 'Zagreb' };
  const office = newLocation('Office');
  const records: { kind: Kind; record: AnyRecord }[] = [
    { kind: 'contacts', record: ana },
    { kind: 'contacts', record: tom },
    { kind: 'contacts', record: lea },
    { kind: 'locations', record: flats },
    { kind: 'locations', record: office },
  ];
  let tick = Date.now() - 500;
  const task = (p: Parameters<typeof newTask>[0]) => records.push({ kind: 'tasks', record: newTask({ createdAt: (tick += 1), source: 'typed', ...p }) });
  task({ title: 'Walk the third floor with Ana before drywall', contactId: ana.id, locationId: flats.id, statusId: 'st-green', dueDate: day(1), dueTime: '08:30', durationMin: 60 });
  task({ title: 'Revised bathroom drawings', contactId: ana.id, statusId: 'st-blue', notes: 'Promised by Friday' });
  task({ title: 'Pressure-test the riser, flat 3B', contactId: tom.id, locationId: flats.id, statusId: 'st-green', dueDate: day(2), dueTime: '10:00', durationMin: 90 });
  task({ title: 'Order 40 m of 20 mm PEX pipe', contactId: tom.id, statusId: 'st-yellow' });
  task({ title: 'Client to pick floor tiles', contactId: lea.id, locationId: flats.id, statusId: 'st-red', notes: 'Three samples left on site' });
  task({ title: 'Send the weekly photo report', contactId: lea.id, locationId: office.id, statusId: 'st-green', dueDate: day(4), dueTime: '16:00', durationMin: 30 });
  task({ title: 'Book the crane for the roof trusses', locationId: flats.id, statusId: 'st-yellow', dueDate: day(7) });
  task({ title: 'Safety walk with the new crew', locationId: flats.id, statusId: 'st-x', dueDate: day(-1), dueTime: '07:30', durationMin: 45 });
  await saveMany(records);
  // Seeds count as local edits; there is no server to sync to, so mark them clean.
  for (const t of [db.tasks, db.contacts, db.locations, db.projects, db.themes]) await t.toCollection().modify({ _dirty: 0 });
}

document.documentElement.lang = getLang();
void (async () => {
  await seedDefaultLegend();
  await adoptDevice(DEMO_USER);
  localStorage.setItem('cg.installGuide', 'never');
  await seedSample();
  const bar = document.createElement('div');
  bar.className = 'lab-demo-bar';
  bar.innerHTML = '<span><b>Calendogram demo</b> · sample data, saved only in this browser · voice uses your browser’s dictation; the real app sorts notes with AI</span><a href="/calendogram/">Back to the project page</a>';
  document.body.prepend(bar);
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
})();
