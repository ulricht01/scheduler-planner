/**
 * scheduler.js – month shift scheduling engine for a 3-person team.
 *
 * Rules encoded:
 *  - Job hours 10:30–22:30 every day.
 *  - Mon–Fri: shift A 10:30–20:00 (9.5 h, alone until 17:00), shift B 17:00–22:30 (5.5 h).
 *  - Sat–Sun: shift A 10:30–20:00 (9.5 h), shift B 11:30–22:30 (11 h).
 *  - Exactly 2 of the 3 people work each day; nobody works both shifts on the same day.
 *  - Every person: >= minHours hours in the month (default 150),
 *    >= 1 full weekend (Sat+Sun) off in the month,
 *    >= minOffPerWeek days off per Mon–Sun week (default 2, capped for short
 *    boundary weeks by floor(daysInWeekInMonth / 3)),
 *    at most maxStreak consecutive working days (default 6).
 *
 * Algorithm (fast constructive + local search, no deep backtracking):
 *  1. Per Mon–Sun week: quotas of off-days per person (r or r+1, r = min(2, floor(d/3))),
 *     complete weekend pairs are claimed by one person (Sat+Sun off together),
 *     quotas + streak limits drive the remaining day-by-day off assignment.
 *  2. Shift A/B split per day: greedy (longer shift of the day to the person
 *     with fewer hours) followed by hill-climbing on swap moves.
 *  3. Verification against the strict rules; failed attempts are retried with a
 *     new seed; then configs are relaxed step by step (reported in meta.relaxations).
 *
 * Works both in the browser (window.ShiftScheduler) and in Node (module.exports).
 */
(function (root, factory) {
  'use strict';
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.ShiftScheduler = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  /** Strict default rules requested by the user. May be overridden per call. */
  var RULES = {
    minHours: 150,
    minOffPerWeek: 2,
    maxStreak: 6,
    requireFullWeekend: true
  };

  /** Normalize a partial rules object against the defaults. */
  function effRules(rules) {
    var r = rules || {};
    return {
      minHours: (r.minHours !== undefined && r.minHours !== null) ? r.minHours : RULES.minHours,
      minOffPerWeek: (r.minOffPerWeek !== undefined && r.minOffPerWeek !== null) ? r.minOffPerWeek : RULES.minOffPerWeek,
      maxStreak: (r.maxStreak !== undefined && r.maxStreak !== null) ? r.maxStreak : RULES.maxStreak,
      requireFullWeekend: (r.requireFullWeekend !== undefined && r.requireFullWeekend !== null) ? !!r.requireFullWeekend : RULES.requireFullWeekend
    };
  }

  /** Build the fallback ladder from effective rules: ladder rows only relax
   * looser than (or equal to) the requested rules, every step deduped. */
  function buildLadder(rules) {
    var steps = [];
    var seen = {};
    function add(cfg) {
      var key = [cfg.minOffPerWeek, cfg.maxStreak, cfg.requireFullWeekend ? 1 : 0, cfg.minHours].join('|');
      if (!seen[key]) { seen[key] = true; steps.push(cfg); }
    }
    var i, s;
    for (i = 0; i < 3; i++) {
      add({ minOffPerWeek: rules.minOffPerWeek, maxStreak: rules.maxStreak + i, requireFullWeekend: rules.requireFullWeekend, minHours: rules.minHours });
    }
    for (s = rules.minOffPerWeek - 1; s >= 0; s--) {
      add({ minOffPerWeek: s, maxStreak: rules.maxStreak + 2, requireFullWeekend: rules.requireFullWeekend, minHours: rules.minHours });
      add({ minOffPerWeek: s, maxStreak: rules.maxStreak + 3, requireFullWeekend: rules.requireFullWeekend, minHours: rules.minHours });
    }
    add({ minOffPerWeek: 0, maxStreak: rules.maxStreak + 3, requireFullWeekend: false, minHours: rules.minHours });
    if (rules.minHours > 0) {
      add({ minOffPerWeek: 0, maxStreak: 99, requireFullWeekend: false, minHours: 0 });
    }
    return steps;
  }

  var LADDER = buildLadder(RULES);

  var PEOPLE = 3;
  var DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  var MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

  /** Shift definitions per day type. */
  function shiftDefs(isWeekend) {
    if (isWeekend) {
      return [
        { slot: 'A', start: '10:30', end: '20:00', hours: 9.5 },
        { slot: 'B', start: '11:30', end: '22:30', hours: 11 }
      ];
    }
    return [
      { slot: 'A', start: '10:30', end: '20:00', hours: 9.5 },
      { slot: 'B', start: '17:00', end: '22:30', hours: 5.5 }
    ];
  }

  /** Small fast seeded PRNG (mulberry32) so runs are reproducible. */
  function mulberry32(seed) {
    var a = seed >>> 0;
    return function () {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      var t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  function shuffled(arr, rng) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(rng() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function isoDate(date) {
    return date.toISOString().slice(0, 10);
  }

  /** Build the static month model: days, weeks, weekend pairs, suffix table. */
  function buildModel(year, month, rules) {
    var req = effRules(rules);
    var dates = [];
    var d = new Date(Date.UTC(year, month - 1, 1));
    while (d.getUTCMonth() === month - 1) {
      dates.push(new Date(d.getTime()));
      d.setUTCDate(d.getUTCDate() + 1);
    }

    var days = dates.map(function (date, i) {
      var dow = date.getUTCDay();               // 0=Sun … 6=Sat
      var isWeekend = dow === 0 || dow === 6;
      var defs = shiftDefs(isWeekend);
      return {
        idx: i,
        date: date,
        iso: isoDate(date),
        dayNum: date.getUTCDate(),
        dow: dow,
        isWeekend: isWeekend,
        week: 0,
        startA: defs[0].start, endA: defs[0].end, hoursA: defs[0].hours,
        startB: defs[1].start, endB: defs[1].end, hoursB: defs[1].hours
      };
    });
    var n = days.length;

    // --- Weeks (Mon–Sun), only days inside the month count -------------
    var weekKeys = [];
    var weekIndexByKey = {};
    days.forEach(function (day) {
      var back = (day.dow + 6) % 7;                       // days since Monday
      var mon = new Date(day.date.getTime() - back * 86400000);
      var key = isoDate(mon);
      if (!(key in weekIndexByKey)) {
        weekIndexByKey[key] = weekKeys.length;
        weekKeys.push(key);
      }
      day.week = weekIndexByKey[key];
    });
    var weekCount = weekKeys.length;
    var weekDays = new Array(weekCount).fill(0);
    var weekEndIdx = new Array(weekCount).fill(0);
    days.forEach(function (day) {
      weekDays[day.week]++;
      weekEndIdx[day.week] = day.idx;
    });
    // Each day frees exactly one person, so a week with d in-month days can give
    // each person at most floor(d/3) off days while keeping the rule uniform.
    var weekRequired = weekDays.map(function (cnt) {
      return Math.min(req.minOffPerWeek, Math.floor(cnt / 3));
    });

    // --- Week day index lists ------------------------------------------
    var weekDayList = [];
    for (var w = 0; w < weekCount; w++) weekDayList.push([]);
    days.forEach(function (day) { weekDayList[day.week].push(day.idx); });

    // --- Complete weekend pairs (Sat + Sun both inside the month) ------
    var pairSatOfSun = new Array(n).fill(-1);    // Sunday idx -> Saturday idx
    var isPairSat = new Array(n).fill(false);
    for (var i = 0; i < n - 1; i++) {
      if (days[i].dow === 6 && days[i + 1].dow === 0) {
        pairSatOfSun[i + 1] = i;
        isPairSat[i] = true;
      }
    }
    // pairsAfter[i] = number of complete pairs whose Saturday index is >= i
    var pairsAfter = new Array(n + 1).fill(0);
    for (var j = n - 1; j >= 0; j--) {
      pairsAfter[j] = pairsAfter[j + 1] + (isPairSat[j] ? 1 : 0);
    }

    // --- Weekly off-day requirement --------------------------------------
    // Each day frees exactly one person. A week with d in-month days of which
    // P are complete weekend pairs (claimed by one person for 2 off days)
    // can satisfy a per-person requirement r' only if
    // (3 - P) * r' + P * 2 <= d. Take the largest r' <= min(2, floor(d/3)).
    var weekPairCount = new Array(weekCount).fill(0);
    days.forEach(function (day) {
      if (isPairSat[day.idx]) weekPairCount[day.week]++;
    });
    var weekRequired = weekDays.map(function (cnt, w) {
      var r = Math.min(req.minOffPerWeek, Math.floor(cnt / 3));
      var P = weekPairCount[w];
      while (r > 0 && (3 - P) * r + P * 2 > cnt) r--;
      return r;
    });

    var totalHours = 0;
    days.forEach(function (day) { totalHours += day.hoursA + day.hoursB; });

    return {
      year: year, month: month, days: days, n: n,
      weekDays: weekDays, weekEndIdx: weekEndIdx, weekRequired: weekRequired,
      weekDayList: weekDayList, weekCount: weekCount, weekPairCount: weekPairCount,
      pairSatOfSun: pairSatOfSun, isPairSat: isPairSat, pairsAfter: pairsAfter,
      totalHours: totalHours,
      avgPerPerson: totalHours / PEOPLE
    };
  }


  /**
   * Phase 1: build the off-person pattern for the whole month.
   * Complete weekend pairs are claimed first (one claimant rests Sat+Sun),
   * then the remaining days are filled greedily with weekly-quota and
   * streak feasibility checks. Returns {off, estHours, weekendWorked, claimed}
   * or null if the attempt fails (caller retries with another seed).
   */
  function buildOffPattern(model, cfg, rng) {
    var n = model.n;
    var off = new Array(n).fill(-1);
    var est = [0, 0, 0];              // estimated hours (avg shift per day type)
    var weekendWorked = [0, 0, 0];    // weekend days worked (fairness)
    var claimed = [0, 0, 0];          // free weekends claimed
    var streak = [0, 0, 0];
    var offCount = [];
    for (var w = 0; w < model.weekCount; w++) offCount.push([0, 0, 0]);

    // --- Claim complete weekend pairs ----------------------------------
    var pairSats = [];
    for (var i = 0; i < n; i++) if (model.isPairSat[i]) pairSats.push(i);
    if (cfg.requireFullWeekend && pairSats.length < PEOPLE) return null; // impossible month shape

    for (var pi = 0; pi < pairSats.length; pi++) {
      var sat = pairSats[pi], sun = sat + 1;
      var wOf = model.days[sat].week;
      // Candidates: prefer people with no free weekend yet.
      var order = [0, 1, 2].sort(function (a, b) {
        var ka = (claimed[a] > 0 ? 1000 : 0) + weekendWorked[a] * 10 + est[a] + rng() * 8;
        var kb = (claimed[b] > 0 ? 1000 : 0) + weekendWorked[b] * 10 + est[b] + rng() * 8;
        return ka - kb;
      });
      var pick = -1;
      for (var oi = 0; oi < 3; oi++) {
        var p = order[oi];
        // Streak feasibility: being off Sat+Sun resets the streak, always fine.
        // Weekly quota: 2 off days granted, cannot exceed d (harmless).
        pick = p; break;
      }
      if (pick < 0) return null;
      off[sat] = pick; off[sun] = pick;
      claimed[pick]++;
      offCount[wOf][pick] += 2;
      streak[pick] = 0;
    }
    // Weekday / unpaired weekend days.
    for (i = 0; i < n; i++) {
      var day = model.days[i];
      var avgShift = (day.hoursA + day.hoursB) / 2;
      if (off[i] !== -1) {
        // Pre-assigned (weekend pair claim): the two workers still gain est. hours.
        for (var wp = 0; wp < PEOPLE; wp++) {
          if (wp !== off[i]) {
            est[wp] += avgShift;
            if (day.isWeekend) weekendWorked[wp]++;
          }
        }
        streak = recomputeStreak(off, i, streak);
        continue;
      }
      var w = day.week;
      // free days left in this week (unassigned), including today
      var free = 0;
      for (var j = i; j <= model.weekEndIdx[w]; j++) if (off[j] === -1) free++;

      var best = -1, bestScore = -Infinity;
      for (var p2 = 0; p2 < PEOPLE; p2++) {
        var score = 0;
        score += est[p2] * 1.5;                 // more estimated hours -> more rest
        score += streak[p2] * 12;               // long streak -> rest
        score += weekendWorked[p2] * 6;         // worked many weekends -> rest
        score += rng() * 4;
        // Weekly quota feasibility if p2 rests today.
        var ok = true;
        var needSum = 0;
        for (var q = 0; q < PEOPLE; q++) {
          var need = model.weekRequired[w] - offCount[w][q] - (q === p2 ? 1 : 0);
          if (need < 0) need = 0;
          if (need > free - 1) ok = false;
          needSum += need;
        }
        if (needSum > free - 1) ok = false;
        if (!ok) continue;
        // Hard: person at streak limit must rest.
        if (streak[p2] >= cfg.maxStreak) score += 100000;
        if (score > bestScore) { bestScore = score; best = p2; }
      }
      if (best < 0) return null;                // no feasible assignment -> retry
      off[i] = best;
      offCount[w][best]++;
      streak = recomputeStreak(off, i, streak);
      // estimate hours: working people gain the day's average shift length
      for (p2 = 0; p2 < PEOPLE; p2++) {
        if (p2 !== best) {
          est[p2] += avgShift;
          if (day.isWeekend) weekendWorked[p2]++;
        }
      }
    }

    // Verify weekly quotas held.
    for (w = 0; w < model.weekCount; w++) {
      for (var p3 = 0; p3 < PEOPLE; p3++) {
        if (offCount[w][p3] < model.weekRequired[w]) return null;
      }
    }
    return { off: off, est: est, weekendWorked: weekendWorked, claimed: claimed };
  }

  /** Recompute the running streak after deciding day i. */
  function recomputeStreak(off, i, streak) {
    var s = streak.slice();
    var person = off[i];
    for (var p = 0; p < PEOPLE; p++) {
      if (p === person) s[p] = 0;
      else s[p]++;
    }
    return s;
  }

  /**
   * Phase 2: given the off-pattern, decide who takes shift A vs B each day.
   * Greedy (longer shift of the day to the person with fewer hours) followed
   * by hill-climbing on swap moves to balance hours and satisfy minHours.
   */
  function splitShifts(model, off, cfg, rng) {
    var n = model.n;
    var aTaker = new Array(n).fill(-1);
    var hours = [0, 0, 0];

    // Greedy pass in random day order.
    var order = shuffled(range(n), rng);
    for (var oi = 0; oi < n; oi++) {
      var i = order[oi];
      var day = model.days[i];
      var workers = [0, 1, 2].filter(function (p) { return p !== off[i]; });
      var aFirst = rng() < 0.5;
      if (!aFirst) workers.reverse();
      // Give the longer shift to the person with fewer hours.
      if (day.hoursB > day.hoursA) workers.reverse();
      aTaker[i] = workers[0];
      hours[workers[0]] += day.hoursA;
      hours[workers[1]] += day.hoursB;
    }

    // Hill-climbing: try swapping A/B on single days; accept improvements.
    function cost(h) {
      var c = 0;
      var avg = model.avgPerPerson;
      for (var p = 0; p < PEOPLE; p++) {
        c += (h[p] - avg) * (h[p] - avg);
        if (h[p] < cfg.minHours) c += 10000 * (cfg.minHours - h[p]);
      }
      return c;
    }

    var cur = cost(hours);
    for (var pass = 0; pass < 6; pass++) {
      var improved = false;
      var daysOrder = shuffled(range(n), rng);
      for (var di = 0; di < n; di++) {
        var d = daysOrder[di];
        var day2 = model.days[d];
        var w0 = aTaker[d];
        var w1 = 3 - off[d] - w0;
        // Swap: w1 takes A, w0 takes B.
        hours[w0] += day2.hoursB - day2.hoursA;
        hours[w1] += day2.hoursA - day2.hoursB;
        var nxt = cost(hours);
        if (nxt < cur - 1e-9) {
          cur = nxt;
          aTaker[d] = w1;
          improved = true;
        } else {
          hours[w0] -= day2.hoursB - day2.hoursA;
          hours[w1] -= day2.hoursA - day2.hoursB;
        }
      }
      if (!improved) break;
    }

    return { aTaker: aTaker, hours: hours };
  }

  function range(n) {
    var a = new Array(n);
    for (var i = 0; i < n; i++) a[i] = i;
    return a;
  }

  /**
   * One full attempt for a config: off-pattern + shift split + verification.
   * Returns a solution object or null.
   */
  function attemptSchedule(model, cfg, seed) {
    var rng = mulberry32(seed);
    var pat = buildOffPattern(model, cfg, rng);
    if (!pat) return null;
    var split = splitShifts(model, pat.off, cfg, rng);

    // Verify minHours; give the deficit another balancing round if needed.
    var deficit = false;
    for (var p = 0; p < PEOPLE; p++) {
      if (split.hours[p] < cfg.minHours) deficit = true;
    }
    if (deficit) {
      var split2 = splitShifts(model, pat.off, cfg, mulberry32(seed ^ 0x5f5f));
      var d2 = false;
      for (p = 0; p < PEOPLE; p++) if (split2.hours[p] < cfg.minHours) d2 = true;
      if (!d2) split = split2;
      else return null;                         // this pattern can't reach minHours
    }

    // Final verification against the config rules.
    for (p = 0; p < PEOPLE; p++) {
      if (split.hours[p] < cfg.minHours) return null;
    }
    if (cfg.requireFullWeekend) {
      for (p = 0; p < PEOPLE; p++) if (pat.claimed[p] < 1) return null;
    }
    return { off: pat.off, aTaker: split.aTaker, hours: split.hours };
  }

  /** Compute per-person totals + weekly info from a raw solution. */
  function computeTotals(model, sol) {
    var totals = [];
    for (var p = 0; p < PEOPLE; p++) {
      totals.push({
        person: p,
        hours: Math.round(sol.hours[p] * 10) / 10,
        weekendDaysWorked: 0,
        weeksAtQuota: 0,
        freeWeekends: []
      });
    }
    model.days.forEach(function (day) {
      if (sol.off[day.idx] !== 0) totals[0].weekendDaysWorked += day.isWeekend ? 1 : 0;
      if (sol.off[day.idx] !== 1) totals[1].weekendDaysWorked += day.isWeekend ? 1 : 0;
      if (sol.off[day.idx] !== 2) totals[2].weekendDaysWorked += day.isWeekend ? 1 : 0;
      // Free weekend: Sat+Sun both off by the same person.
      if (model.isPairSat[day.idx] && sol.off[day.idx] === sol.off[day.idx + 1]) {
        totals[sol.off[day.idx]].freeWeekends.push(
          model.days[day.idx].dayNum + '–' + model.days[day.idx + 1].dayNum
        );
      }
    });
    // Weekly off counts.
    var weeks = [];
    for (var w = 0; w < model.weekCount; w++) {
      var offDays = [0, 0, 0];
      model.days.forEach(function (day) {
        if (day.week === w) offDays[sol.off[day.idx]]++;
      });
      weeks.push({
        week: w + 1,
        required: model.weekRequired[w],
        offDays: offDays,
        ok: offDays.every(function (c, p2) { return c >= model.weekRequired[w]; })
      });
      for (var pi = 0; pi < PEOPLE; pi++) {
        if (offDays[pi] >= model.weekRequired[w]) totals[pi].weeksAtQuota++;
      }
    }
    return { people: totals, weeks: weeks };
  }

  /**
   * Generate a schedule for the given month.
   * options: { year, month (1-12), seed?, rules? }.
   * Returns { year, month, days[], people[], weeks[], meta (incl. effective rules, seed) } or throws.
   */
  function generate(options) {
    var year = options.year;
    var month = options.month;
    var rules = effRules(options.rules);
    var ladder = buildLadder(rules);
    var model = buildModel(year, month, rules);
    var seed = (options.seed !== undefined) ? options.seed : Math.floor(Math.random() * 0x7fffffff);
    var relaxations = [];
    var sol = null;
    var usedCfg = null;

    for (var rung = 0; rung < ladder.length && !sol; rung++) {
      var cfg = ladder[rung];
      for (var attempt = 0; attempt < 400 && !sol; attempt++) {
        sol = attemptSchedule(model, cfg, seed + rung * 7919 + attempt * 104729);
      }
      if (sol) {
        usedCfg = cfg;
        if (cfg.minOffPerWeek < rules.minOffPerWeek) {
          relaxations.push('Only ' + cfg.minOffPerWeek + ' day(s) off per week (rule: ' + rules.minOffPerWeek + ')');
        }
        if (cfg.maxStreak > rules.maxStreak) {
          relaxations.push('Up to ' + cfg.maxStreak + ' consecutive workdays (rule: ' + rules.maxStreak + ')');
        }
        if (!cfg.requireFullWeekend && rules.requireFullWeekend) {
          relaxations.push('Full weekend off could not be guaranteed for everyone');
        }
        if (cfg.minHours !== rules.minHours) {
          relaxations.push('Minimum ' + rules.minHours + ' h could not be reached; best effort shown');
        }
      }
    }

    if (!sol) {
      throw new Error('No feasible schedule for ' + year + '-' + month);
    }

    // Materialize day records.
    var days = model.days.map(function (day) {
      return {
        date: day.iso,
        dayNum: day.dayNum,
        dow: day.dow,
        isWeekend: day.isWeekend,
        off: sol.off[day.idx],
        shifts: [
          { slot: 'A', start: day.startA, end: day.endA, hours: day.hoursA, person: sol.aTaker[day.idx] },
          { slot: 'B', start: day.startB, end: day.endB, hours: day.hoursB, person: 3 - sol.off[day.idx] - sol.aTaker[day.idx] }
        ]
      };
    });

    var totals = computeTotals(model, sol);
    var spread = Math.max.apply(null, sol.hours) - Math.min.apply(null, sol.hours);

    return {
      year: year,
      month: month,
      days: days,
      people: totals.people,
      weeks: totals.weeks,
      rules: rules,
      meta: {
        seed: seed,
        totalHours: model.totalHours,
        avgPerPerson: Math.round(model.avgPerPerson * 10) / 10,
        hoursSpread: Math.round(spread * 10) / 10,
        relaxations: relaxations,
        config: usedCfg
      }
    };
  }

  /**
   * Recompute per-person totals + weekly info from a possibly hand-edited
   * schedule object (as returned by generate()). Uses the schedule's own
   * stored rules if present, else the effective rules passed via options.
   * Returns { people: [...same shape as generate()'s people...], weeks }.
   */
  function recompute(schedule, options) {
    var rules = effRules((schedule && schedule.rules) || (options && options.rules));
    var model = buildModel(schedule.year, schedule.month, rules);
    var n = schedule.days.length;
    var off = new Array(n);
    var aTaker = new Array(n);
    var hours = [0, 0, 0];
    schedule.days.forEach(function (day, i) {
      off[i] = day.off;
      aTaker[i] = day.shifts[0].person;
      day.shifts.forEach(function (sh) {
        hours[sh.person] += sh.hours;
      });
    });
    return computeTotals(model, { off: off, aTaker: aTaker, hours: hours });
  }

  /**
   * Validate a generated schedule against the effective rules (from the
   * schedule itself if present, else the defaults / options.rules).
   * Works on the object returned by generate(), including after manual UI edits.
   * Returns { ok, violations: [{code, message, person?}] }.
   */
  function validate(schedule, options) {
    var v = [];
    var rules = effRules((schedule && schedule.rules) || (options && options.rules));
    var model = buildModel(schedule.year, schedule.month, rules);
    var hours = [0, 0, 0];
    var streak = [0, 0, 0];
    var maxStreakSeen = [0, 0, 0];
    var offCount = [];
    for (var w = 0; w < model.weekCount; w++) offCount.push([0, 0, 0]);
    var hasFree = [false, false, false];

    schedule.days.forEach(function (day, i) {
      var md = model.days[i];
      var persons = day.shifts.map(function (s) { return s.person; });
      // Coverage: exactly two distinct people, none is the "off" person.
      if (persons[0] === persons[1]) {
        v.push({ code: 'coverage', message: day.date + ': same person on both shifts' });
        return;
      }
      if (persons.indexOf(day.off) !== -1) {
        v.push({ code: 'coverage', message: day.date + ': off person is scheduled' });
      }
      var expected = [0, 1, 2].filter(function (p) { return p !== day.off; });
      persons.forEach(function (p) {
        var k = expected.indexOf(p);
        if (k >= 0) expected.splice(k, 1);
      });
      if (expected.length !== 0) {
        v.push({ code: 'coverage', message: day.date + ': not exactly 2 workers' });
      }
      // Shift times must match the day type.
      day.shifts.forEach(function (s, si) {
        var want = shiftDefs(md.isWeekend)[si];
        if (s.start !== want.start || s.end !== want.end) {
          v.push({ code: 'shifts', message: day.date + ': wrong shift times for day type' });
        }
      });
      // Accumulate hours / streaks / off counts.
      day.shifts.forEach(function (s) {
        if (s.person >= 0 && s.person < PEOPLE) {
          hours[s.person] += s.hours;
          streak[s.person]++;
          if (streak[s.person] > maxStreakSeen[s.person]) maxStreakSeen[s.person] = streak[s.person];
        }
      });
      if (day.off >= 0 && day.off < PEOPLE) {
        streak[day.off] = 0;
        offCount[md.week][day.off]++;
      }
      // Free weekend: Sat+Sun both off, same person.
      if (model.isPairSat[i] && schedule.days[i + 1] && schedule.days[i + 1].off === day.off) {
        hasFree[day.off] = true;
      }
    });

    hours.forEach(function (h, p) {
      if (h < rules.minHours) {
        v.push({ code: 'hours', person: p, message: 'Person ' + (p + 1) + ': only ' + h + ' h (min ' + rules.minHours + ' h)' });
      }
    });
    hasFree.forEach(function (ok, p) {
      if (!ok && rules.requireFullWeekend) {
        v.push({ code: 'weekend', person: p, message: 'Person ' + (p + 1) + ': no full weekend (Sat+Sun) off' });
      }
    });
    maxStreakSeen.forEach(function (mx, p) {
      if (mx > rules.maxStreak) {
        v.push({ code: 'streak', person: p, message: 'Person ' + (p + 1) + ': ' + mx + ' consecutive workdays (max ' + rules.maxStreak + ')' });
      }
    });
    for (w = 0; w < model.weekCount; w++) {
      for (var p2 = 0; p2 < PEOPLE; p2++) {
        if (offCount[w][p2] < model.weekRequired[w]) {
          v.push({
            code: 'weekly', person: p2,
            message: 'Person ' + (p2 + 1) + ': week ' + (w + 1) + ' has ' + offCount[w][p2] +
              ' day(s) off (min ' + model.weekRequired[w] + ')'
          });
        }
      }
    }

    return { ok: v.length === 0, violations: v };
  }

  return {
    RULES: RULES,
    DAY_NAMES: DAY_NAMES,
    MONTH_NAMES: MONTH_NAMES,
    generate: generate,
    validate: validate,
    recompute: recompute
  };
});





