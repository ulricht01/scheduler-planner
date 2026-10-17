/**
 * prof.js – quick timing check for a single month. Usage: node prof.js [year] [month]
 */
'use strict';
const S = require('./scheduler.js');
const year = parseInt(process.argv[2] || '2026', 10);
const month = parseInt(process.argv[3] || '2', 10);
const t0 = Date.now();
try {
  const s = S.generate({ year, month, seed: 42 });
  const ms = Date.now() - t0;
  console.log('OK ' + ms + ' ms hours=' + s.people.map(p => p.hours).join(',') +
    ' relax=' + (s.meta.relaxations.join('; ') || 'none'));
} catch (e) {
  console.log('ERR ' + (Date.now() - t0) + ' ms ' + e.message);
}
