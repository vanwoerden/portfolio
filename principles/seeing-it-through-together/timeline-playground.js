(function () {
  'use strict';

  var TOGETHER_GAP_WEEKS = 1;
  var MAX_PROJECTS = 26;
  var MAX_PERSON_WEEKS = 52;
  var MAX_HEADCOUNT = 20;
  var MAX_ENGINEER_RATIO = 20;
  var MAX_TARGET_WEEKS = 120;
  var MAX_DISPLAY_WEEKS = 120;
  var DEBOUNCE_MS = 80;
  var debounceTimer = null;

  function clamp(n, lo, hi) {
    return Math.max(lo, Math.min(hi, n));
  }

  function ceilDiv(a, b) {
    return Math.ceil(a / b);
  }

  function readInt(el, fallback, lo, hi) {
    if (!el) return fallback;
    var v = parseInt(el.value, 10);
    if (isNaN(v)) return fallback;
    return clamp(v, lo, hi);
  }

  function projectLetter(index) {
    return String.fromCharCode(65 + index);
  }

  function projectClass(index) {
    if (index === 0) return 'project-a';
    if (index === 1) return 'project-b';
    if (index === 2) return 'project-c';
    return '';
  }

  function projectBackground(index) {
    if (index < 3) return '';
    var hue = (index * 47) % 360;
    return 'hsl(' + hue + ', 62%, 52%)';
  }

  function computeSchedule(numProjects, wPmDesigner, engineerRatio, pmCount, desCount, engCount, mode) {
    var n = numProjects;
    var wEng = wPmDesigner * engineerRatio;
    var pmStart = [];
    var pmEnd = [];
    var desStart = [];
    var desEnd = [];
    var engStart = [];
    var engEnd = [];

    for (var p = 0; p < n; p++) {
      var pmW = ceilDiv(wPmDesigner, pmCount);
      var dW = ceilDiv(wPmDesigner, desCount);
      var eW = ceilDiv(wEng, engCount);

      if (p === 0) {
        pmStart[p] = 0;
      } else {
        pmStart[p] = pmEnd[p - 1] + 1;
      }
      pmEnd[p] = pmStart[p] + pmW - 1;

      var prevDesEnd = p === 0 ? -1 : desEnd[p - 1];
      var prevEngEnd = p === 0 ? -1 : engEnd[p - 1];

      var dStart;
      if (mode === 'staggered') {
        dStart = Math.max(pmEnd[p] + 1, prevDesEnd + 1);
      } else if (mode === 'between') {
        dStart = Math.max(pmStart[p] + Math.floor(pmW / 2), prevDesEnd + 1);
      } else {
        dStart = Math.max(pmStart[p] + TOGETHER_GAP_WEEKS, prevDesEnd + 1);
      }
      desStart[p] = dStart;
      desEnd[p] = dStart + dW - 1;

      var eStart;
      if (mode === 'staggered') {
        eStart = Math.max(desEnd[p] + 1, prevEngEnd + 1);
      } else if (mode === 'between') {
        eStart = Math.max(desStart[p] + Math.floor(dW / 2), prevEngEnd + 1);
      } else {
        eStart = Math.max(desStart[p] + TOGETHER_GAP_WEEKS, prevEngEnd + 1);
      }
      engStart[p] = eStart;
      engEnd[p] = eStart + eW - 1;
    }

    var lastIdx = engEnd[n - 1];
    return {
      pmStart: pmStart,
      pmEnd: pmEnd,
      desStart: desStart,
      desEnd: desEnd,
      engStart: engStart,
      engEnd: engEnd,
      lastWeekIndex: lastIdx,
      completeWeek1Based: lastIdx + 1,
      totalWeeks: lastIdx + 1
    };
  }

  function activeProject(starts, ends, t, n) {
    for (var p = 0; p < n; p++) {
      if (t >= starts[p] && t <= ends[p]) return p;
    }
    return -1;
  }

  function appendBlocks(container, starts, ends, displayWeeks, numProjects) {
    for (var t = 0; t < displayWeeks; t++) {
      var proj = activeProject(starts, ends, t, numProjects);
      var div = document.createElement('div');
      div.className = 'block';
      if (proj < 0) {
        div.className += ' tp-idle';
        div.textContent = 'x';
        div.title = 'Week ' + (t + 1) + ', idle';
      } else {
        var cls = projectClass(proj);
        if (cls) div.className += ' ' + cls + ' tp-project';
        else {
          div.className += ' tp-project';
          div.style.background = projectBackground(proj);
        }
        div.textContent = projectLetter(proj);
        div.title = 'Week ' + (t + 1) + ', project ' + projectLetter(proj);
      }
      container.appendChild(div);
    }
  }

  function buildWeekHeader(displayWeeks) {
    var row = document.createElement('div');
    row.className = 'tp-weeks-header';
    var step = displayWeeks <= 40 ? 1 : displayWeeks <= 80 ? 2 : 4;
    for (var w = 1; w <= displayWeeks; w++) {
      var cell = document.createElement('div');
      cell.className = 'tp-week-cell';
      if (step === 1 || w === 1 || w === displayWeeks || w % step === 0) {
        cell.className += ' tp-week-tick';
        cell.textContent = String(w);
      }
      row.appendChild(cell);
    }
    return row;
  }

  function labelText(role, count) {
    if (role === 'pm') return count === 1 ? '1 PM' : count + ' PMs';
    if (role === 'designer') return count === 1 ? '1 Designer' : count + ' Designers';
    return count === 1 ? '1 Engineer' : count + ' Engineers';
  }

  function render() {
    var form = document.getElementById('timeline-playground-form');
    var chart = document.getElementById('timeline-playground-chart');
    var summary = document.getElementById('timeline-playground-summary');
    if (!form || !chart || !summary) return;

    var pmC = readInt(document.getElementById('tp-pm'), 1, 1, MAX_HEADCOUNT);
    var desC = readInt(document.getElementById('tp-designer'), 1, 1, MAX_HEADCOUNT);
    var engC = readInt(document.getElementById('tp-eng'), 4, 1, MAX_HEADCOUNT);
    var n = readInt(document.getElementById('tp-projects'), 3, 1, MAX_PROJECTS);
    var wBase = readInt(document.getElementById('tp-weeks'), 4, 1, MAX_PERSON_WEEKS);
    var engRatio = readInt(document.getElementById('tp-ratio-eng'), 4, 1, MAX_ENGINEER_RATIO);
    var target = readInt(document.getElementById('tp-target'), 28, 1, MAX_TARGET_WEEKS);
    var modeEl = document.getElementById('tp-mode');
    var mode = modeEl && modeEl.value ? modeEl.value : 'staggered';

    document.getElementById('tp-pm').value = String(pmC);
    document.getElementById('tp-designer').value = String(desC);
    document.getElementById('tp-eng').value = String(engC);
    document.getElementById('tp-projects').value = String(n);
    document.getElementById('tp-weeks').value = String(wBase);
    document.getElementById('tp-ratio-eng').value = String(engRatio);
    document.getElementById('tp-target').value = String(target);

    var sched = computeSchedule(n, wBase, engRatio, pmC, desC, engC, mode);
    var rawTotal = sched.totalWeeks;
    var displayWeeks = Math.min(Math.max(rawTotal, target), MAX_DISPLAY_WEEKS);
    var chartTruncated = rawTotal > MAX_DISPLAY_WEEKS;

    chart.innerHTML = '';
    chart.hidden = false;

    var inner = document.createElement('div');
    inner.className = 'tp-chart-inner';

    var labelOffsetPx = 112;
    var blockPx = 20;

    var targetLine = null;
    var targetLbl = null;
    if (target >= 1 && target <= displayWeeks) {
      var lineX = labelOffsetPx + target * blockPx;
      targetLine = document.createElement('div');
      targetLine.className = 'tp-target-line';
      targetLine.style.left = lineX + 'px';
      targetLine.setAttribute('aria-hidden', 'true');
      targetLbl = document.createElement('span');
      targetLbl.className = 'tp-target-label';
      targetLbl.style.left = lineX + 'px';
      targetLbl.textContent = 'Target end wk ' + target;
      inner.appendChild(targetLbl);
      inner.appendChild(targetLine);
    }

    var header = buildWeekHeader(displayWeeks);
    inner.appendChild(header);

    function makeRow(roleKey, starts, ends) {
      var wrap = document.createElement('div');
      wrap.className = 'discipline-container';
      var lab = document.createElement('div');
      lab.className = 'discipline-label';
      lab.textContent = labelText(roleKey, roleKey === 'pm' ? pmC : roleKey === 'designer' ? desC : engC);
      var blocks = document.createElement('div');
      blocks.className = 'blocks';
      appendBlocks(blocks, starts, ends, displayWeeks, n);
      wrap.appendChild(lab);
      wrap.appendChild(blocks);
      return wrap;
    }

    inner.appendChild(makeRow('pm', sched.pmStart, sched.pmEnd));
    inner.appendChild(makeRow('designer', sched.desStart, sched.desEnd));
    inner.appendChild(makeRow('eng', sched.engStart, sched.engEnd));

    chart.appendChild(inner);

    if (targetLine) {
      var hdr = inner.querySelector('.tp-weeks-header');
      var hdrBottom = hdr ? hdr.offsetTop + hdr.offsetHeight : 18;
      targetLine.style.top = hdrBottom + 'px';
      targetLine.style.bottom = '0';
    }

    var complete = sched.completeWeek1Based;
    var delta = complete - target;
    var parts = [];
    parts.push(
      'Last engineering work ends in week ' +
        complete +
        ' (calendar weeks from start). Effort per project: PM ' +
        wBase +
        ', designer ' +
        wBase +
        ', engineers ' +
        wBase * engRatio +
        ' person-weeks (1:1:' +
        engRatio +
        ').'
    );
    if (delta <= 0) {
      parts.push('Target was finish by end of week ' + target + ' — on or inside target.');
    } else {
      parts.push('Target was end of week ' + target + ' — ' + delta + ' week' + (delta === 1 ? '' : 's') + ' past that.');
    }
    if (chartTruncated) {
      parts.push('Timeline view stops at week ' + displayWeeks + '; true finish is week ' + complete + '.');
    }
    summary.textContent = parts.join(' ');
  }

  function scheduleRender() {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(function () {
      debounceTimer = null;
      render();
    }, DEBOUNCE_MS);
  }

  function init() {
    var form = document.getElementById('timeline-playground-form');
    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
      });
      form.addEventListener('input', scheduleRender);
      form.addEventListener('change', scheduleRender);
    }
    render();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
