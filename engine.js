// DonorClock engine - blood donation eligibility math (no DOM)
(function (root) {
  'use strict';

  var DAY = 86400000;

  // Intervals follow common Red Cross / blood-service rules.
  var TYPES = [
    { id: 'whole',     label: 'Whole blood',        interval: 56,  perYear: 6,  ml: 470, lives: 3 },
    { id: 'powerred',  label: 'Power red (2RBC)',   interval: 112, perYear: 3,  ml: 470, lives: 3 },
    { id: 'platelets', label: 'Platelets',          interval: 7,   perYear: 24, ml: 250, lives: 3 },
    { id: 'plasma',    label: 'Plasma',             interval: 28,  perYear: 13, ml: 650, lives: 3 }
  ];

  function typeById(id) {
    for (var i = 0; i < TYPES.length; i++) if (TYPES[i].id === id) return TYPES[i];
    return null;
  }

  function iso(d) {
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }
  function parse(s) {
    var p = String(s).split('-');
    return new Date(+p[0], +p[1] - 1, +p[2]);
  }
  function addDays(d, n) {
    var x = new Date(d.getTime());
    x.setDate(x.getDate() + n);
    return x;
  }
  function daysBetween(a, b) {
    var x = new Date(a.getTime()); x.setHours(0,0,0,0);
    var y = new Date(b.getTime()); y.setHours(0,0,0,0);
    return Math.round((y - x) / DAY);
  }

  // Per-type status for a list of donations [{date, type}], as of today.
  // Interval clock runs from the last donation OF THAT TYPE; platelets also has a rolling 12-month cap.
  function statusFor(typeId, donations, today) {
    var t = typeById(typeId);
    var mine = donations.filter(function (d) { return d.type === typeId; })
      .sort(function (a, b) { return a.date < b.date ? -1 : 1; });
    var last = mine.length ? mine[mine.length - 1] : null;
    var yearAgo = iso(addDays(today, -365));
    var last12 = mine.filter(function (d) { return d.date >= yearAgo; }).length;
    var intervalDaysLeft = 0;
    if (last) intervalDaysLeft = Math.max(0, t.interval - daysBetween(parse(last.date), today));
    var capHit = last12 >= t.perYear;
    var daysLeft = intervalDaysLeft;
    if (capHit && intervalDaysLeft === 0) {
      // find when the oldest in-window donation expires out of the 12-month window
      var oldest = mine.filter(function (d) { return d.date >= yearAgo; })[0];
      daysLeft = Math.max(1, daysBetween(today, addDays(parse(oldest.date), 365)));
    }
    return {
      type: typeId,
      eligible: intervalDaysLeft === 0 && !capHit,
      daysLeft: daysLeft,
      nextDate: daysLeft === 0 ? iso(today) : iso(addDays(today, daysLeft)),
      lastDate: last ? last.date : null,
      countLast12: last12,
      countTotal: mine.length,
      capHit: capHit
    };
  }

  function status(donations, today) {
    return TYPES.map(function (t) { return statusFor(t.id, donations, today); });
  }

  function totals(donations) {
    var ml = 0, lives = 0, byType = {};
    donations.forEach(function (d) {
      var t = typeById(d.type);
      if (!t) return;
      ml += t.ml; lives += t.lives;
      byType[d.type] = (byType[d.type] || 0) + 1;
    });
    return { donations: donations.length, ml: ml, liters: Math.round(ml / 100) / 10, lives: lives, byType: byType };
  }

  // Simple streak: donations in each of the last N rolling 12-month periods.
  function yearStreak(donations, today) {
    if (!donations.length) return 0;
    var streak = 0;
    for (var y = 0; y < 50; y++) {
      var hi = addDays(today, -365 * y);
      var lo = addDays(today, -365 * (y + 1));
      var any = donations.some(function (d) {
        var dt = parse(d.date);
        return dt > lo && dt <= hi;
      });
      if (!any) break;
      streak++;
    }
    return streak;
  }

  var api = {
    TYPES: TYPES, typeById: typeById,
    iso: iso, parse: parse, addDays: addDays, daysBetween: daysBetween,
    statusFor: statusFor, status: status, totals: totals, yearStreak: yearStreak
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.DonorEngine = api;
})(typeof self !== 'undefined' ? self : this);
