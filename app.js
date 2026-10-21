/**
 */
(function () {
  'use strict';

  function escapeHtml(t) {
    return String(t).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function personStyle(i) {
    var colors = ['#2563eb', '#059669', '#7c3aed'];
    var tints  = ['#dbeafe', '#d1fae5', '#ede9fe'];
    if (i >= 0 && i < colors.length) return { color: colors[i], tint: tints[i] };
    return { color: '#475569', tint: '#e2e8f0' };
  }

  /* ---------------- i18n ---------------- */
  var LANG = 'en';

  var T = {
    en: {
      appTitle: 'Scheduler Planner',
      appSub: 'Month schedule for a 3-person team · scheduler engine v2',
      year: 'Year',
      month: 'Month',
      today: 'Today',
      calendar: 'Calendar',
      people: 'People',
      off: 'off',
      person: 'Person {0}',
      newSchedule: '🔄 New schedule',
      advanced: 'Advanced ▾',
      scheduleVariant: 'Schedule variant',
      apply: 'apply',
      csv: '📥 CSV',
      pdf: '🖨️ PDF (print to PDF)',
      rules: 'Rules:',
      minHours: 'Min h',
      minOffPerWeek: 'Off/week',
      maxStreak: 'Max streak',
      fullWeekend: 'Full weekend',
      defaults: 'Defaults',
      hint: 'Click a day cell, then a person chip to rest them. Drag a shift onto another to swap. Drag a shift onto an off-chip (same day) to trade days off.',
      selected: 'Selected {0}',
      generateEmpty: 'Generate a schedule to see who is working.',
      prevMonth: 'Previous month',
      nextMonth: 'Next month',
      shiftTitle: 'Shift {0} {1} · {2}–{3} · {4} h',
      offTitle: '{0} is off',
      offChip: 'OFF · {0}',
      errGenerate: 'Could not generate schedule: {0}',
      loaded: 'Loaded {0}-{1} in {2} ms · rules {3}h/{4}off/{5}str · {6} · spread {7} h · relaxations: {8}',
      relaxNone: 'none',
      liveOk: 'Live validation: OK',
      liveViolations: ' violation(s)',
      liveRelax: ' · relaxations: ',
      pickerLabel: 'Who rests on {0} (shift {1})?',
      cancel: 'Cancel',
      ok: 'OK',
      csvDate: 'date',
      csvDow: 'dow',
      csvType: 'type',
      csvShiftA: 'shiftA',
      csvShiftB: 'shiftB',
      csvOff: 'off',
      csvWeekend: 'weekend',
      csvWeekday: 'weekday',
      printTitle: 'Scheduler Planner',
      printRules: 'Min {0} h/month · {1} off/week · max streak {2} · {3}',
      printFullWeekend: 'full weekend off',
      printNoWeekend: 'no weekend rule',
      printWeekendDays: 'Weekend days',
      printWeeksAtQuota: 'Weeks at quota',
      printFullWeekendsOff: 'Full weekends off',
      printOff: 'off',
      printPerson: 'Person {0}',
      printPerson1: 'Person 1',
      printPerson2: 'Person 2',
      printPerson3: 'Person 3',
      weekendFull: 'full weekend',
      weekendNoFull: 'no weekend rule',
      dayDetail: 'Day detail',
      shiftA: 'Shift A',
      shiftB: 'Shift B',
      offPerson: 'Off',
      totalHours: 'Total hours',
      close: 'Close'
    },
    de: {
      appTitle: 'Scheduler Planner',
      appSub: 'Dienstplan für ein 3-köpfiges Team · Scheduler-Engine v2',
      year: 'Jahr',
      month: 'Monat',
      today: 'Heute',
      calendar: 'Kalender',
      people: 'Personen',
      off: 'frei',
      person: 'Person {0}',
      newSchedule: '🔄 Neuer Dienstplan',
      advanced: 'Erweitert ▾',
      scheduleVariant: 'Dienstplan-Variante',
      apply: 'Übernehmen',
      csv: '📥 CSV',
      pdf: '🖨️ PDF (als PDF drucken)',
      rules: 'Regeln:',
      minHours: 'Min Std.',
      minOffPerWeek: 'Frei/Woche',
      maxStreak: 'Max Serie',
      fullWeekend: 'Volle Wochenende frei',
      defaults: 'Standard',
      hint: 'Klicke auf eine Zelle, dann auf einen Namen, um ihn einzuteilen. Ziehe eine Schicht auf eine andere, um zu tauschen. Ziehe eine Schicht auf ein „frei“-Chip (gleicher Tag), um freie Tage zu tauschen.',
      selected: 'Gewählt {0}',
      generateEmpty: 'Erstelle einen Dienstplan, um zu sehen, wer arbeitet.',
      prevMonth: 'Vorheriger Monat',
      nextMonth: 'Nächster Monat',
      shiftTitle: 'Schicht {0} {1} · {2}–{3} · {4} Std.',
      offTitle: '{0} hat frei',
      offChip: 'FREI · {0}',
      errGenerate: 'Dienstplan konnte nicht erstellt werden: {0}',
      loaded: 'Geladen {0}-{1} in {2} ms · Regeln {3} Std./{4} frei/Wo/{5} Serie · {6} · Verteilung {7} Std. · Abweichungen: {8}',
      relaxNone: 'keine',
      liveOk: 'Live-Validierung: OK',
      liveViolations: ' Verstöße',
      liveRelax: ' · Abweichungen: ',
      pickerLabel: 'Wer hat {0} frei (Schicht {1})?',
      cancel: 'Abbrechen',
      ok: 'OK',
      csvDate: 'Datum',
      csvDow: 'Wochentag',
      csvType: 'Typ',
      csvShiftA: 'Schicht A',
      csvShiftB: 'Schicht B',
      csvOff: 'Frei',
      csvWeekend: 'Wochenende',
      csvWeekday: 'Werktag',
      printTitle: 'Scheduler Planner',
      printRules: 'Min {0} Std./Monat · {1} frei/Woche · max. Serie {2} · {3}',
      printFullWeekend: 'volles Wochenende frei',
      printNoWeekend: 'keine Wochenend-Regel',
      printWeekendDays: 'Wochenendtage',
      printWeeksAtQuota: 'Wochen im Soll',
      printFullWeekendsOff: 'Freie volle Wochenenden',
      printOff: 'frei',
      printPerson: 'Person {0}',
      printPerson1: 'Person 1',
      printPerson2: 'Person 2',
      printPerson3: 'Person 3',
      weekendFull: 'volles Wochenende',
      weekendNoFull: 'keine Wochenend-Regel',
      dayDetail: 'Tag-Details',
      shiftA: 'Schicht A',
      shiftB: 'Schicht B',
      offPerson: 'Frei',
      totalHours: 'Std. gesamt',
      close: 'Schließen'
    }
  };

  function t(key) {
    var args = Array.prototype.slice.call(arguments, 1);
    var tmpl = (T[LANG] && T[LANG][key]) || (T.en[key]) || key;
    return tmpl.replace(/{(\d+)}/g, function (m, i) { return args[i] || ''; });
  }

  var DAY_NAMES_DE = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
  var MONTH_NAMES_DE = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
    'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];

  function setLang(lang) {
    LANG = lang;
    $('langBtn').textContent = lang === 'de' ? '🇩🇪 DE' : '🇬🇧 EN';
    DAY_NAMES = lang === 'de' ? DAY_NAMES_DE : DAY_NAMES_EN;
    MONTH_NAMES = lang === 'de' ? MONTH_NAMES_DE : MONTH_NAMES_EN.slice(0);
    document.documentElement.lang = lang;
    document.title = t('appTitle');
    translateUI();
    render();
  }

  function translateUI() {
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var key = el.getAttribute('data-i18n');
      el.textContent = t(key);
    });
    $('yearSelect').setAttribute('aria-label', t('year'));
    $('monthSelect').setAttribute('aria-label', t('month'));
    $('prevBtn').setAttribute('aria-label', t('prevMonth'));
    $('nextBtn').setAttribute('aria-label', t('nextMonth'));
    $('todayBtn').setAttribute('aria-label', t('today'));
    $('langBtn').setAttribute('aria-label', 'Toggle language');
  }

  function renderCalendar() {
    var cal = $('calendar');
    cal.innerHTML = '';
    var offset = gridOffset(state.year, state.month);
    var first = startOfMonth(state.year, state.month);
    var last = endOfMonth(state.year, state.month);
    var sel = state.selected;

    var head = document.createElement('div');
    head.className = 'cal-head';
    for (var d = 0; d < 7; d++) {
      var h = document.createElement('div');
      h.className = 'dow' + ((d === 5 || d === 6) ? ' weekend' : '');
      h.textContent = DAY_NAMES[(d + 1) % 7];
      head.appendChild(h);
    }
    cal.appendChild(head);

    var body = document.createElement('div');
    body.className = 'cal-body';

    var totalCells = offset + last.getDate();
    for (var i = 0; i < totalCells; i++) {
      var cell = document.createElement('div');
      cell.className = 'cal-cell' + (sel === i ? ' selected' : '');

      var dayIndex = i - offset;
      var date = new Date(first.getFullYear(), first.getMonth(), dayIndex + 1);
      var isCur = date.getMonth() === state.month - 1;
      var isWk = (date.getDay() === 0 || date.getDay() === 6);

      if (!isCur) {
        cell.classList.add('muted');
        cell.title = (date.getMonth() === first.getMonth() - 1 ? t('prevMonth') : t('nextMonth')) +
          ' ' + date.getDate();
      } else {
        cell.dataset.idx = dayIndex;
        if (isWk) cell.classList.add('wkend');

        var num = document.createElement('div');
        num.className = 'dnum';
        num.textContent = date.getDate();
        cell.appendChild(num);

        var dw = document.createElement('div');
        dw.className = 'dow-in-cell' + (isWk ? ' weekend' : '');
        dw.textContent = DAY_NAMES[date.getDay()];
        cell.appendChild(dw);

        var day = state.schedule.days[dayIndex];
        var sw = document.createElement('div');
        sw.className = 'shifts';

        day.shifts.forEach(function (sh, si) {
          var s = personStyle(sh.person >= 0 ? sh.person : -1);
          var b = document.createElement('div');
          b.className = 'shift' + (si === 0 ? ' a' : ' b');
          b.style.background = sh.person >= 0 ? s.color : '#94a3b8';
          b.style.color = '#fff';
          b.draggable = true;
          b.dataset.dayIdx = dayIndex;
          b.dataset.shiftIdx = si;
          b.dataset.isOff = 'false';
          var who = sh.person >= 0 ? state.names[sh.person] : '–';
          var letter = String.fromCharCode(65 + si);
          b.innerHTML = '<span class="letter">' + letter + '</span> ' + escapeHtml(who);
          b.title = t('shiftTitle', letter, who, sh.start, sh.end, sh.hours);
          sw.appendChild(b);
        });

        if (day.off >= 0) {
          cell.classList.add('off-day');
          var ob = document.createElement('div');
          ob.className = 'shift off';
          ob.draggable = true;
          ob.dataset.dayIdx = dayIndex;
          ob.dataset.shiftIdx = '-1';
          ob.dataset.isOff = 'true';
          ob.textContent = t('offChip', escapeHtml(state.names[day.off]));
          ob.title = t('offTitle', state.names[day.off]);
          sw.appendChild(ob);
        }

        cell.appendChild(sw);
      }
      body.appendChild(cell);
    }
    cal.appendChild(body);
    $('selInfo').textContent = (sel !== null && sel !== undefined && sel >= 0)
      ? t('selected', state.schedule.days[sel].date) : '';
  }

  var S = window.ShiftScheduler;
  var DAY_NAMES_EN = S.DAY_NAMES;
  var MONTH_NAMES_EN = S.MONTH_NAMES;
  var DAY_NAMES = DAY_NAMES_EN.slice(0);
  var MONTH_NAMES = MONTH_NAMES_EN.slice(0);
  var STORAGE_KEY = 'stribrnik_planner_v1';

  var state = {
    year: 2026,
    month: 2,
    seed: 42,
    names: ['Pavel', 'Matej', 'Lucie'],
    rules: { minHours: 150, minOffPerWeek: 2, maxStreak: 6, requireFullWeekend: true },
    schedule: null,
    selected: null,
    pickerMode: null,
    status: 'idle'
  };

  var dragState = null; // {dayIdx, shiftIdx, personIdx}

  var $ = function (id) { return document.getElementById(id); };

  function pad(n) { return n < 10 ? '0' + n : '' + n; }

  function startOfMonth(y, m) { return new Date(y, m - 1, 1); }
  function endOfMonth(y, m) { return new Date(y, m, 0); }

  function gridOffset(year, month) {
    var dow = new Date(year, month - 1, 1).getDay();
    return dow === 0 ? 6 : dow - 1;
  }

  /** Read the rules panel inputs into state.rules and refresh the panel defaults. */
  function readRulesFromPanel() {
    var h = parseInt($('ruleHours').value, 10);
    var o = parseInt($('ruleOff').value, 10);
    var s = parseInt($('ruleStreak').value, 10);
    state.rules = {
      minHours: isNaN(h) ? state.rules.minHours : h,
      minOffPerWeek: isNaN(o) ? state.rules.minOffPerWeek : o,
      maxStreak: isNaN(s) ? state.rules.maxStreak : s,
      requireFullWeekend: $('ruleWeekend').checked
    };
  }

  function writeRulesToPanel() {
    $('ruleHours').value = state.rules.minHours;
    $('ruleOff').value = state.rules.minOffPerWeek;
    $('ruleStreak').value = state.rules.maxStreak;
    $('ruleWeekend').checked = !!state.rules.requireFullWeekend;
  }

  function loadSchedule() {
    var t0 = Date.now();
    var sched;
    try {
      sched = S.generate({ year: state.year, month: state.month, seed: state.seed, rules: state.rules });
    } catch (e) {
      setStatus('error', t('errGenerate', e.message));
      return;
    }
    var res = S.validate(sched);
    state.schedule = sched;
    state.validated = res.ok;
    state.violations = res.violations;
    refreshTotals();
    setStatus(res.ok ? 'ok' : 'bad', t('loaded',
      state.year, state.month, Date.now() - t0,
      state.rules.minHours, state.rules.minOffPerWeek, state.rules.maxStreak,
      state.rules.requireFullWeekend ? t('weekendFull') : t('weekendNoFull'),
      sched.meta.hoursSpread,
      sched.meta.relaxations.length ? sched.meta.relaxations.join(', ') : t('relaxNone')));
    render();
  }

  function regenerate() {
    if ($('advPanel').classList.contains('hidden')) {
      state.seed = Math.floor(Math.random() * 2147483647);
    } else {
      state.seed = parseInt($('seedInput').value, 10) || 42;
    }
    state.selected = null;
    loadSchedule();
  }

  function setStatus(cl, msg) {
    var bar = $('statusBar') || (function () {
      var el = document.createElement('div');
      el.id = 'statusBar';
      document.body.insertBefore(el, document.body.firstChild);
      return el;
    })();
    bar.className = 'status-bar ' + cl;
    bar.textContent = msg;
  }

  function bindNames() {
    $('name0').value = state.names[0];
    $('name1').value = state.names[1];
    $('name2').value = state.names[2];
    $('name0').placeholder = t('person', 1);
    $('name1').placeholder = t('person', 2);
    $('name2').placeholder = t('person', 3);
    $('name0').addEventListener('change', function () { state.names[0] = this.value.trim() || t('person', 1); render(); });
    $('name1').addEventListener('change', function () { state.names[1] = this.value.trim() || t('person', 2); render(); });
    $('name2').addEventListener('change', function () { state.names[2] = this.value.trim() || t('person', 3); render(); });
  }
  function renderSummary() {
    var sum = $('summary');
    sum.innerHTML = '';
    if (!state.schedule) {
      sum.innerHTML = '<div class="empty">' + t('generateEmpty') + '</div>';
      return;
    }
    var weekendDays = state.schedule.days.filter(function (d) { return d.isWeekend; }).length;
    state.schedule.people.forEach(function (p, i) {
      var s = personStyle(i);
      var name = state.names[i] || t('person', i + 1);
      var col = document.createElement('div');
      col.className = 'pcard';
      col.style.borderLeft = '4px solid ' + s.color;
      col.innerHTML =
        '<div class="pname" style="color:' + s.color + '">' + escapeHtml(name) + '</div>' +
        '<div class="phours">' + p.hours.toFixed(1) + ' h</div>' +
        '<div class="pstat"><span>' + t('printWeekendDays') + '</span><strong>' + p.weekendDaysWorked +
          ' / ' + weekendDays + '</strong></div>' +
        '<div class="pstat"><span>' + t('printWeeksAtQuota') + '</span><strong>' + p.weeksAtQuota + '</strong></div>' +
        '<div class="pstat"><span>' + t('printFullWeekendsOff') + '</span><strong>' +
          (p.freeWeekends.length ? p.freeWeekends.join(', ') : t('relaxNone')) + '</strong></div>';
      sum.appendChild(col);
    });
  }

  function renderCalendarSelects() {
    var ys = $('yearSelect');
    var ms = $('monthSelect');
    ys.innerHTML = '';
    ms.innerHTML = '';
    for (var y = 2024; y <= 2028; y++) {
      var o = document.createElement('option');
      o.value = y;
      o.textContent = y;
      ys.appendChild(o);
    }
    for (var m = 1; m <= 12; m++) {
      var o2 = document.createElement('option');
      o2.value = m; o2.textContent = MONTH_NAMES[m - 1];
      ms.appendChild(o2);
    }
    ys.value = state.year;
    ms.value = state.month;
  }

  function render() {
    bindNames();
    renderCalendar();
    renderSummary();
    renderCalendarSelects();
  }

  function openPicker(kind) {
    state.pickerMode = { kind: kind, date: state.selected };
    $('pickerLabel').textContent = t('pickerLabel', state.schedule.days[state.selected].date, kind);
    var list = $('pickerList');
    list.innerHTML = '';
    for (var i = 0; i < state.names.length; i++) {
      var btn = document.createElement('button');
      btn.className = 'pperson';
      btn.textContent = state.names[i];
      btn.addEventListener('click', (function (idx) {
        return function () { onPickerClick(idx); };
      })(i));
      list.appendChild(btn);
    }
    $('pickerOverlay').classList.remove('hidden');
    $('pickerOverlay').classList.add('show');
  }

  function closePicker() {
    $('pickerOverlay').classList.remove('show');
    $('pickerOverlay').classList.add('hidden');
    state.pickerMode = null;
  }

  function openDayDetail(dayIndex) {
    var day = state.schedule.days[dayIndex];
    var dowName = DAY_NAMES[new Date(day.date).getDay()];
    $('dayDetailTitle').textContent = day.date + ' · ' + dowName;

    var content = $('dayDetailContent');
    content.innerHTML = '';

    var totalHours = 0;

    day.shifts.forEach(function (sh, si) {
      var letter = String.fromCharCode(65 + si);
      var s = personStyle(sh.person >= 0 ? sh.person : -1);

      var row = document.createElement('div');
      row.className = 'shift-row';

      var chip = document.createElement('div');
      chip.className = 'shift-chip';
      chip.style.background = sh.person >= 0 ? s.color : '#94a3b8';
      chip.textContent = letter;

      var info = document.createElement('div');
      info.className = 'shift-info';

      var personDiv = document.createElement('div');
      personDiv.className = 'shift-person';
      personDiv.textContent = sh.person >= 0 ? state.names[sh.person] : '–';

      var timeDiv = document.createElement('div');
      timeDiv.className = 'shift-time';
      timeDiv.textContent = sh.start + '–' + sh.end + ' · ' + sh.hours + ' h';

      info.appendChild(personDiv);
      info.appendChild(timeDiv);
      row.appendChild(chip);
      row.appendChild(info);
      content.appendChild(row);

      totalHours += sh.hours;
    });

    if (day.off >= 0) {
      var row = document.createElement('div');
      row.className = 'shift-row';

      var chip = document.createElement('div');
      chip.className = 'shift-chip';
      chip.style.background = '#475569';
      chip.textContent = 'O';

      var info = document.createElement('div');
      info.className = 'shift-info';

      var personDiv = document.createElement('div');
      personDiv.className = 'shift-person';
      personDiv.textContent = state.names[day.off];

      var timeDiv = document.createElement('div');
      timeDiv.className = 'shift-time';
      timeDiv.textContent = t('offPerson');

      info.appendChild(personDiv);
      info.appendChild(timeDiv);
      row.appendChild(chip);
      row.appendChild(info);
      content.appendChild(row);
    }

    var totalRow = document.createElement('div');
    totalRow.className = 'total-row';
    var totalLabel = document.createElement('span');
    totalLabel.textContent = t('totalHours');
    var totalValue = document.createElement('span');
    totalValue.className = 'total-value';
    totalValue.textContent = totalHours.toFixed(1) + ' h';
    totalRow.appendChild(totalLabel);
    totalRow.appendChild(totalValue);
    content.appendChild(totalRow);

    var overlay = $('dayDetailOverlay');
    overlay.classList.remove('hidden');
    overlay.classList.add('show');
  }

  function closeDayDetail() {
    var overlay = $('dayDetailOverlay');
    overlay.classList.remove('show');
    overlay.classList.add('hidden');
  }

  function pickPersonForSlot(dayIndex, shiftIdx) {
    if (dayIndex === null || dayIndex === undefined || dayIndex < 0) return;
    state.selected = dayIndex;
    renderCalendar();
    openPicker(shiftIdx === 0 ? 'A' : 'B');
  }

  function onPickerClick(personIdx) {
    if (!state.pickerMode) return;
    applyAssignment(state.pickerMode.date, state.pickerMode.kind, personIdx);
  }

  function applyAssignment(dayIndex, kind, personIdx) {
    var day = state.schedule.days[dayIndex];
    var oldA = day.shifts[0].person;
    var oldB = day.shifts[1].person;
    var off = day.off;

    if (kind === 'off') {
      if (off < 0 || off !== personIdx) return; // only the current off person can rest
      day.off = personIdx;
      if (oldA === personIdx) day.shifts[0].person = oldB;
      if (oldB === personIdx) day.shifts[1].person = oldA;
    } else {
      var workers = [0, 1, 2].filter(function (p) { return p !== off; });
      if (workers.indexOf(personIdx) === -1) return; // must be a worker
      if (kind === 'A') {
        day.shifts[0].person = personIdx;
        day.shifts[1].person = (oldB === personIdx) ? oldA : oldB;
      } else {
        day.shifts[1].person = personIdx;
        day.shifts[0].person = (oldA === personIdx) ? oldB : oldA;
      }
    }
    closePicker();
    revalidate();
    refreshTotals();
    render();
  }

  function swapChips(d1, s1, d2, s2) {
    // s1/s2: 0 or 1 = shift slot, -1 = off person
    if (d1 === d2 && s1 === s2) return;
    var day1 = state.schedule.days[d1];
    var day2 = state.schedule.days[d2];

    var p1 = s1 === -1 ? day1.off : day1.shifts[s1].person;
    var p2 = s2 === -1 ? day2.off : day2.shifts[s2].person;
    if (p1 < 0 || p2 < 0 || p1 === p2) return;

    // ---- Shift ↔ Shift ----
    if (s1 !== -1 && s2 !== -1) {
      if (d1 === d2) {
        // Same day: just swap A↔B
        day1.shifts[s1].person = p2;
        day1.shifts[s2].person = p1;
      } else {
        // Different days: each day must keep two distinct workers
        var day1Other = day1.shifts[1 - s1].person;
        var day2Other = day2.shifts[1 - s2].person;
        if (p2 === day1Other || p1 === day2Other) return;
        // Cannot place the off person of a day onto a shift of that day
        if (p2 === day1.off || p1 === day2.off) return;
        day1.shifts[s1].person = p2;
        day2.shifts[s2].person = p1;
      }
    }
    // ---- Shift ↔ Off (same day only) ----
    else if (d1 === d2 && (s1 === -1 || s2 === -1)) {
      var day = day1;
      var shiftIdx = s1 === -1 ? s2 : s1;
      var offPerson = s1 === -1 ? p1 : p2;
      var shiftPerson = s1 === -1 ? p2 : p1;
      day.off = shiftPerson;
      day.shifts[shiftIdx].person = offPerson;
    }
    // ---- Off ↔ Off (different days) ----
    else if (s1 === -1 && s2 === -1 && d1 !== d2) {
      day1.off = p2;
      day2.off = p1;
    }
    else return;

    revalidate();
    refreshTotals();
    render();
  }

  function revalidate() {
    var res = S.validate(state.schedule);
    state.validated = res.ok;
    state.violations = res.violations;
    setStatus(res.ok ? 'ok' : 'bad',
      t('liveOk') + (res.ok ? '' : t('liveViolations', res.violations.length)) +
      (state.schedule.meta.relaxations.length ? t('liveRelax') + state.schedule.meta.relaxations.join(', ') : ''));
  }

  function refreshTotals() {
    if (!state.schedule) return;
    var totals = S.recompute(state.schedule);
    state.schedule.people = totals.people;
    state.schedule.weeks = totals.weeks;
  }

  function exportCsv() {
    if (!state.schedule) return;
    var lines = [];
    lines.push([t('csvDate'), t('csvDow'), t('csvType'), t('csvShiftA'), t('csvShiftB'), t('csvOff')].join(';'));
    state.schedule.days.forEach(function (d) {
      lines.push([
        d.date, d.dow, d.isWeekend ? t('csvWeekend') : t('csvWeekday'),
        'A:' + (d.shifts[0].person >= 0 ? state.names[d.shifts[0].person] : '–') + '@' + d.shifts[0].hours + 'h',
        'B:' + (d.shifts[1].person >= 0 ? state.names[d.shifts[1].person] : '–') + '@' + d.shifts[1].hours + 'h',
        d.off >= 0 ? state.names[d.off] : '–'
      ].join(';'));
    });
    downloadFile(lines.join('\n'), state.year + '-' + pad(state.month) + '.csv', 'text/csv;charset=utf-8');
  }

  function exportPdf() {
    var printEl = document.getElementById('printRoot');
    if (!printEl) {
      printEl = document.createElement('div');
      printEl.id = 'printRoot';
      printEl.className = 'print-only';
      document.body.appendChild(printEl);
    }
    populatePrintRoot(printEl);
    window.print();
  }

  function populatePrintRoot(root) {
    root.innerHTML = '';
    var monthName = MONTH_NAMES[state.month - 1];

    var header = document.createElement('div');
    header.className = 'print-header';
    header.innerHTML =
      '<div class="print-title">' + t('printTitle') + '</div>' +
      '<div class="print-month">' + monthName + ' ' + state.year + '</div>' +
      '<div class="print-rules">' + t('printRules',
        state.rules.minHours, state.rules.minOffPerWeek, state.rules.maxStreak,
        state.rules.requireFullWeekend ? t('printFullWeekend') : t('printNoWeekend')) + '</div>';
    root.appendChild(header);

    var calWrap = document.createElement('div');
    calWrap.className = 'print-calendar';

    var head = document.createElement('div');
    head.className = 'print-cal-head';
    for (var d = 0; d < 7; d++) {
      var h = document.createElement('div');
      h.className = 'print-dow' + ((d === 5 || d === 6) ? ' weekend' : '');
      h.textContent = DAY_NAMES[(d + 1) % 7];
      head.appendChild(h);
    }
    calWrap.appendChild(head);

    var body = document.createElement('div');
    body.className = 'print-cal-body';

    var offset = gridOffset(state.year, state.month);
    var first = startOfMonth(state.year, state.month);
    var last = endOfMonth(state.year, state.month);
    var totalCells = offset + last.getDate();

    for (var i = 0; i < totalCells; i++) {
      var cell = document.createElement('div');
      cell.className = 'print-cal-cell';
      var dayIndex = i - offset;
      var date = new Date(first.getFullYear(), first.getMonth(), dayIndex + 1);
      var isCur = date.getMonth() === state.month - 1;
      var isWk = (date.getDay() === 0 || date.getDay() === 6);

      if (!isCur) {
        cell.classList.add('muted');
      } else {
        cell.dataset.idx = dayIndex;
        if (isWk) cell.classList.add('wkend');

        var dnum = document.createElement('div');
        dnum.className = 'print-dnum';
        dnum.textContent = date.getDate();
        cell.appendChild(dnum);

        var dw = document.createElement('div');
        dw.className = 'print-dow-in-cell' + (isWk ? ' weekend' : '');
        dw.textContent = DAY_NAMES[date.getDay()];
        cell.appendChild(dw);

        var day = state.schedule.days[dayIndex];
        var shifts = document.createElement('div');
        shifts.className = 'print-shifts';

        day.shifts.forEach(function (sh, si) {
          var s = personStyle(sh.person >= 0 ? sh.person : -1);
          var b = document.createElement('div');
          b.className = 'print-shift';
          b.style.background = sh.person >= 0 ? s.color : '#94a3b8';
          var who = sh.person >= 0 ? state.names[sh.person] : '–';
          var letter = String.fromCharCode(65 + si);
          b.innerHTML = '<span class="letter">' + letter + '</span> ' + escapeHtml(who);
          shifts.appendChild(b);
        });

        if (day.off >= 0) {
          cell.classList.add('off-day');
          var ob = document.createElement('div');
          ob.className = 'print-shift print-off';
          ob.textContent = t('offChip', escapeHtml(state.names[day.off]));
          shifts.appendChild(ob);
        }

        cell.appendChild(shifts);
      }
      body.appendChild(cell);
    }
    calWrap.appendChild(body);
    root.appendChild(calWrap);

    var sumWrap = document.createElement('div');
    sumWrap.className = 'print-summary';
    var weekendDays = state.schedule.days.filter(function (d) { return d.isWeekend; }).length;
    state.schedule.people.forEach(function (p, i) {
      var s = personStyle(i);
      var name = state.names[i] || t('person', i + 1);
      var card = document.createElement('div');
      card.className = 'print-pcard';
      card.style.borderLeft = '4px solid ' + s.color;
      card.innerHTML =
        '<div class="pname" style="color:' + s.color + '">' + escapeHtml(name) + '</div>' +
        '<div class="phours">' + p.hours.toFixed(1) + ' h</div>' +
        '<div class="pstat"><span>' + t('printWeekendDays') + '</span><strong>' + p.weekendDaysWorked + ' / ' + weekendDays + '</strong></div>' +
        '<div class="pstat"><span>' + t('printWeeksAtQuota') + '</span><strong>' + p.weeksAtQuota + '</strong></div>' +
        '<div class="pstat"><span>' + t('printFullWeekendsOff') + '</span><strong>' + (p.freeWeekends.length ? p.freeWeekends.join(', ') : t('relaxNone')) + '</strong></div>';
      sumWrap.appendChild(card);
    });
    root.appendChild(sumWrap);

    var legend = document.createElement('div');
    legend.className = 'print-legend';
    legend.innerHTML =
      '<span><span style="background:var(--off);color:#fff;border-radius:3px;padding:1px 5px">●</span> ' + t('printOff') + '</span>' +
      '<span><span style="background:var(--p0);color:#fff;border-radius:3px;padding:1px 5px">●</span> <b style="color:var(--p0)">' + t('printPerson', 1) + '</b></span>' +
      '<span><span style="background:var(--p1);color:#fff;border-radius:3px;padding:1px 5px">●</span> <b style="color:var(--p1)">' + t('printPerson', 2) + '</b></span>' +
      '<span><span style="background:var(--p2);color:#fff;border-radius:3px;padding:1px 5px">●</span> <b style="color:var(--p2)">' + t('printPerson', 3) + '</b></span>';
    root.appendChild(legend);
  }

  function downloadFile(content, filename, mime) {
    var blob = new Blob([content], { type: mime });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function saveState() {
    try {
      var data = {
        year: state.year, month: state.month, seed: state.seed,
        names: state.names, rules: state.rules,
        schedule: state.schedule ? JSON.parse(JSON.stringify(state.schedule)) : null
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) { /* ignore */ }
  }

  function loadState() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      var data = JSON.parse(raw);
      state.year = data.year || 2026;
      state.month = data.month || 2;
      state.seed = data.seed || 42;
      state.names = data.names || ['Pavel', 'Matej', 'Lucie'];
      if (data.rules) state.rules = {
        minHours: data.rules.minHours !== undefined ? data.rules.minHours : state.rules.minHours,
        minOffPerWeek: data.rules.minOffPerWeek !== undefined ? data.rules.minOffPerWeek : state.rules.minOffPerWeek,
        maxStreak: data.rules.maxStreak !== undefined ? data.rules.maxStreak : state.rules.maxStreak,
        requireFullWeekend: data.rules.requireFullWeekend !== undefined ? !!data.rules.requireFullWeekend : state.rules.requireFullWeekend
      };
      state.schedule = data.schedule || null;
    } catch (e) { /* ignore */ }
  }

  function init() {
    loadState();
    if (!state.schedule) loadSchedule();
    $('prevBtn').addEventListener('click', function () {
      state.month--;
      if (state.month < 1) { state.month = 12; state.year--; }
      state.selected = null;
      loadSchedule();
    });
    $('nextBtn').addEventListener('click', function () {
      state.month++;
      if (state.month > 12) { state.month = 1; state.year++; }
      state.selected = null;
      loadSchedule();
    });
    $('todayBtn').addEventListener('click', function () {
      var now = new Date();
      state.year = now.getFullYear();
      state.month = now.getMonth() + 1;
      state.selected = null;
      loadSchedule();
    });
    $('langBtn').addEventListener('click', function () {
      setLang(LANG === 'en' ? 'de' : 'en');
    });
    $('advToggle').addEventListener('click', function () {
      $('advPanel').classList.toggle('hidden');
    });
    $('seedInput').value = state.seed;
    writeRulesToPanel();
    $('rulesQuickDefaults').addEventListener('click', function () {
      state.rules = { minHours: 150, minOffPerWeek: 2, maxStreak: 6, requireFullWeekend: true };
      writeRulesToPanel();
      state.selected = null;
      loadSchedule();
    });
    ['ruleHours', 'ruleOff', 'ruleStreak', 'ruleWeekend'].forEach(function (id) {
      $(id).addEventListener('change', function () {
        readRulesFromPanel();
        state.selected = null;
        loadSchedule();
      });
    });
    $('seedApply').addEventListener('click', regenerate);
    $('regenBtn').addEventListener('click', regenerate);
    $('dayDetailClose').addEventListener('click', closeDayDetail);
    $('dayDetailOverlay').addEventListener('click', function (e) {
      if (e.target === $('dayDetailOverlay')) closeDayDetail();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        closePicker();
        closeDayDetail();
      }
    });
    $('exportCsv').addEventListener('click', exportCsv);
    $('exportPdf').addEventListener('click', exportPdf);

    $('calendar').addEventListener('click', function (e) {
      var cell = e.target.closest('.cal-cell');
      if (!cell || !cell.dataset.idx) return;
      var dayIndex = parseInt(cell.dataset.idx, 10);
      var shift = e.target.closest('.shift');
      state.selected = dayIndex;
      render();
      if (!shift) {
        openDayDetail(dayIndex);
      }
    });
    // ---- mouse drag & drop for desktop ----
    var mouseState = null;

    $('calendar').addEventListener('mousedown', function (e) {
      var shift = e.target.closest('.shift');
      if (!shift || !shift.dataset.dayIdx) return;
      var d = parseInt(shift.dataset.dayIdx, 10);
      var s = shift.dataset.shiftIdx === '-1' ? -1 : parseInt(shift.dataset.shiftIdx, 10);
      var p = s === -1 ? state.schedule.days[d].off : state.schedule.days[d].shifts[s].person;
      if (p < 0) return;
      mouseState = { dayIdx: d, shiftIdx: s, personIdx: p, isOff: s === -1 };
      shift.classList.add('drag-source');
      e.preventDefault();
    });

    document.addEventListener('mousemove', function (e) {
      if (!mouseState) return;
      e.preventDefault();
      var target = document.elementFromPoint(e.clientX, e.clientY);
      var shift = target ? target.closest('.shift') : null;
      document.querySelectorAll('.shift').forEach(function (el) {
        el.classList.remove('drop-target');
      });
      if (shift && shift.dataset.dayIdx && shift.dataset.dayIdx != mouseState.dayIdx) {
        shift.classList.add('drop-target');
      }
    });

    document.addEventListener('mouseup', function (e) {
      if (!mouseState) return;
      var target = document.elementFromPoint(e.clientX, e.clientY);
      var shift = target ? target.closest('.shift') : null;
      document.querySelectorAll('.shift').forEach(function (el) {
        el.classList.remove('drag-source', 'drop-target');
      });
      if (shift && shift.dataset.dayIdx && !shift.classList.contains('drag-source')) {
        var d2 = parseInt(shift.dataset.dayIdx, 10);
        var s2 = shift.dataset.shiftIdx === '-1' ? -1 : parseInt(shift.dataset.shiftIdx, 10);
        if (d2 !== mouseState.dayIdx || s2 !== mouseState.shiftIdx) {
          swapChips(mouseState.dayIdx, mouseState.shiftIdx, d2, s2);
        }
      }
      mouseState = null;
    });

    // ---- touch drag & drop (mobile) ----
    // ---- touch drag & drop (mobile) ----
    var touchState = null;

    $('calendar').addEventListener('touchstart', function (e) {
      var shift = e.target.closest('.shift');
      if (!shift || !shift.dataset.dayIdx) return;
      var d = parseInt(shift.dataset.dayIdx, 10);
      var s = shift.dataset.shiftIdx === '-1' ? -1 : parseInt(shift.dataset.shiftIdx, 10);
      if (s === -1 && shift.classList.contains('off')) {
        touchState = { dayIdx: d, shiftIdx: s, isOff: true };
      } else if (s !== -1) {
        var person = state.schedule.days[d].shifts[s].person;
        if (person < 0) return;
        touchState = { dayIdx: d, shiftIdx: s, personIdx: person, isOff: false };
      } else {
        return;
      }
      shift.classList.add('drag-source');
      e.preventDefault();
    }, { passive: false });

    $('calendar').addEventListener('touchmove', function (e) {
      if (!touchState) return;
      e.preventDefault();
      var touch = e.touches[0];
      var target = document.elementFromPoint(touch.clientX, touch.clientY);
      var shift = target ? target.closest('.shift') : null;
      document.querySelectorAll('.shift').forEach(function (el) {
        el.classList.remove('drop-target');
      });
      if (shift && shift.dataset.dayIdx && shift.dataset.dayIdx != touchState.dayIdx) {
        shift.classList.add('drop-target');
      }
    }, { passive: false });
    $('calendar').addEventListener('touchend', function (e) {
      if (!touchState) return;
      var touch = e.changedTouches[0];
      var target = document.elementFromPoint(touch.clientX, touch.clientY);
      var shift = target ? target.closest('.shift') : null;
      document.querySelectorAll('.shift').forEach(function (el) {
        el.classList.remove('drag-source', 'drop-target');
      });
      if (shift && shift.dataset.dayIdx && !shift.classList.contains('drag-source')) {
        var d2 = parseInt(shift.dataset.dayIdx, 10);
        var s2 = shift.dataset.shiftIdx === '-1' ? -1 : parseInt(shift.dataset.shiftIdx, 10);
        if (d2 !== touchState.dayIdx || s2 !== touchState.shiftIdx) {
          swapChips(touchState.dayIdx, touchState.shiftIdx, d2, s2);
        }
      }
      touchState = null;
    }, { passive: false });


    $('yearSelect').addEventListener('change', function () {
      var y = parseInt($('yearSelect').value, 10);
      state.year = y || state.year;
      state.selected = null;
      loadSchedule();
    });
    $('monthSelect').addEventListener('change', function () {
      var m = parseInt($('monthSelect').value, 10);
      state.month = m || state.month;
      state.selected = null;
      loadSchedule();
    });

    $('seedInput').addEventListener('keydown', function (e) {
      if (e.key === 'Enter') regenerate();
    });

    render();
    translateUI();
    window.addEventListener('beforeunload', saveState);
  }

  document.addEventListener('DOMContentLoaded', init);
  document.getElementById('pickerOverlay').addEventListener('click', closePicker);
  document.getElementById('pickerOverlay').addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closePicker();
  });
})();

