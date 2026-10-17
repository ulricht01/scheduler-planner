/**
 * validate.js – run the scheduler for every month of 2025–2027 and assert
 * every rule. Usage: node validate.js
 */
'use strict';

const Scheduler = require('./scheduler.js');

let failures = 0;
const rows = [];

for (const year of [2025, 2026, 2027]) {
  for (let month = 1; month <= 12; month++) {
    const label = year + '-' + String(month).padStart(2, '0');
    let sched;
    const t0 = Date.now();
    try {
      sched = Scheduler.generate({ year, month, seed: 42 });
    } catch (e) {
      console.error('FAIL ' + label + ': ' + e.message);
      failures++;
      continue;
    }
    const ms = Date.now() - t0;
    const res = Scheduler.validate(sched);

    // Structural sanity beyond validate(): count coverage exactly.
    const perDayOk = sched.days.every(d => d.shifts.length === 2 && d.shifts[0].person !== d.shifts[1].person);

    if (!res.ok || !perDayOk) {
      failures++;
      console.error('FAIL ' + label);
      res.violations.forEach(v => console.error('   - ' + v.message));
      if (!perDayOk) console.error('   - structural coverage problem');
    } else {
      const hrs = sched.people.map(p => p.hours);
      const fw = sched.people.map(p => p.freeWeekends.length);
      rows.push({
        month: label,
        h1: hrs[0], h2: hrs[1], h3: hrs[2],
        spread: sched.meta.hoursSpread,
        fw1: fw[0], fw2: fw[1], fw3: fw[2],
        relax: sched.meta.relaxations.length ? sched.meta.relaxations.join('; ') : '',
        ms
      });
    }
  }
}

console.log('\nMonth    | P1 h  | P2 h  | P3 h  | Sprd | Free wknds (P1/P2/P3) | Relaxations');
console.log('---------+-------+-------+-------+------+-----------------------+------------');
for (const r of rows) {
  console.log(
    r.month + ' | ' +
    String(r.h1).padStart(5) + ' | ' +
    String(r.h2).padStart(5) + ' | ' +
    String(r.h3).padStart(5) + ' | ' +
    String(r.spread).padStart(4) + ' | ' +
    (r.fw1 + '/' + r.fw2 + '/' + r.fw3).padStart(21) + ' | ' +
    r.relax
  );
}

const relaxed = rows.filter(r => r.relax).length;
console.log('\n' + rows.length + ' months OK, ' + relaxed + ' needed relaxations, ' + failures + ' failures.');
if (relaxed) console.log('(Relaxed months still validate against the strict rules — see relaxations column.)');

// ---------------------------------------------------------------------------
// Two-month rule comparison (tryout): Feb 2026 (tight 28-day month) and
// Mar 2026 (looser 31-day month) under each rule set.
// - default:  the strict default rules (150 h, 2 off/week, streak 6, full weekend)
// - relaxed:  a looser tryout set (120 h, 1 off/week, streak 8, no full weekend)
// - strict:   a tighter tryout set (165 h, 2 off/week, streak 5, full weekend)
// ---------------------------------------------------------------------------
const RULE_SETS = {
  default: undefined,
  relaxed: { minHours: 120, minOffPerWeek: 1, maxStreak: 8, requireFullWeekend: false },
  strict: { minHours: 165, minOffPerWeek: 2, maxStreak: 5, requireFullWeekend: true }
};
console.log('\nRule comparison (Feb + Mar 2026):');
for (const name of Object.keys(RULE_SETS)) {
  for (const [yy, mm] of [[2026, 2], [2026, 3]]) {
    const label = yy + '-' + String(mm).padStart(2, '0');
    const t0b = Date.now();
    let s2;
    try {
      s2 = Scheduler.generate({ year: yy, month: mm, seed: 42, rules: RULE_SETS[name] });
    } catch (e) {
      console.log('  ' + name.padEnd(8) + label + ': FAIL ' + e.message);
      failures++;
      continue;
    }
    const ms2 = Date.now() - t0b;
    const chk = Scheduler.validate(s2);
    const hrs = s2.people.map(p => p.hours).join('/');
    console.log('  ' + name.padEnd(8) + label + ' (rules ' + (name === 'default' ? '150h/2off/6str/full' : JSON.stringify(RULE_SETS[name])) + '): ' +
      ms2 + ' ms, hours=' + hrs + ', spread=' + s2.meta.hoursSpread +
      ', freeWknd=' + s2.people.map(p => p.freeWeekends.length).join('/') +
      ', relax=' + (s2.meta.relaxations.join('; ') || 'none') +
      ', valid=' + (chk.ok ? 'OK' : 'FAIL[' + chk.violations.map(v => v.message).join('; ') + ']'));
  }
}

// Determinism: same seed twice must produce identical schedules.
const a = Scheduler.generate({ year: 2026, month: 2, seed: 7 });
const b = Scheduler.generate({ year: 2026, month: 2, seed: 7 });
const same = JSON.stringify(a.days) === JSON.stringify(b.days);
console.log('Determinism (same seed): ' + (same ? 'OK' : 'FAILED'));
if (!same) failures++;

// Variety: different seeds should differ at least sometimes.
const c = Scheduler.generate({ year: 2026, month: 2, seed: 8 });
const differs = JSON.stringify(a.days) !== JSON.stringify(c.days);
console.log('Variety (different seeds differ): ' + (differs ? 'OK' : 'identical (acceptable but unlikely)'));

// Validate that manual edits are detected: corrupt one day and expect violations.
const d = Scheduler.generate({ year: 2026, month: 3, seed: 1 });
d.days[10].shifts[1].person = d.days[10].shifts[0].person; // same person both shifts
const bad = Scheduler.validate(d);
console.log('Corruption detected by validate(): ' + (!bad.ok ? 'OK' : 'FAILED'));
if (bad.ok) failures++;

process.exit(failures ? 1 : 0);
