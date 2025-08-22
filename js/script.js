// Calendar using jalaali-js — parity with persianDate behavior
(function () {
  const weekDays = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'];
  const monthNames = [
    'فروردین','اردیبهشت','خرداد','تیر','مرداد','شهریور',
    'مهر','آبان','آذر','دی','بهمن','اسفند'
  ];

  const state = {
    1: { view: new Date(), selected: null }, // start
    2: { view: new Date(), selected: null }  // end
  };

  const calEls = {
    1: document.getElementById('calendar1'),
    2: document.getElementById('calendar2')
  };
  const displayEls = {
    1: document.getElementById('displayDate1'),
    2: document.getElementById('displayDate2')
  };

  // ---- Date utils (Gregorian <-> Jalaali) ----
  function toJ(date) {
    const j = jalaali.toJalaali(date);
    return { y: j.jy, m: j.jm, d: j.jd };
  }
  function fromJ(y, m, d) {
    const g = jalaali.toGregorian(y, m, d);
    return new Date(g.gy, g.gm - 1, g.gd);
  }
  function formatJ(date) {
    if (!date) return '';
    const j = toJ(date);
    return `${j.y}/${String(j.m).padStart(2,'0')}/${String(j.d).padStart(2,'0')}`;
  }
  function sameJ(a, b) {
    if (!a || !b) return false;
    const ja = toJ(a), jb = toJ(b);
    return ja.y === jb.y && ja.m === jb.m && ja.d === jb.d;
  }

  // ---- Popups (month/year) ----
  function removePopups(id) {
    calEls[id].querySelectorAll('.month-popup, .year-popup').forEach(el => el.remove());
  }
  function showMonthPopup(id) {
    removePopups(id);
    const s = state[id];
    const j = toJ(s.view);
    const wrap = document.createElement('div');
    wrap.className = 'month-popup';
    monthNames.forEach((name, idx) => {
      const div = document.createElement('div');
      div.textContent = name;
      div.addEventListener('click', (e) => {
        e.stopPropagation();
        s.view = fromJ(j.y, idx + 1, 1);
        removePopups(id);
        renderCalendar(id);
      });
      wrap.appendChild(div);
    });
    calEls[id].appendChild(wrap);
  }
  function showYearPopup(id) {
    removePopups(id);
    const s = state[id];
    const j = toJ(s.view);
    const wrap = document.createElement('div');
    wrap.className = 'year-popup';
    for (let y = j.y - 6; y <= j.y + 5; y++) {
      const div = document.createElement('div');
      div.textContent = y;
      div.addEventListener('click', (e) => {
        e.stopPropagation();
        s.view = fromJ(y, j.m, 1);
        removePopups(id);
        renderCalendar(id);
      });
      wrap.appendChild(div);
    }
    calEls[id].appendChild(wrap);
  }

  // ---- Header (prev/next + clickable month/year) ----
  function buildHeader(id) {
    const s = state[id];
    const j = toJ(s.view);
    const header = document.createElement('div');
    header.className = 'calendar-header';

    const prev = document.createElement('button');
    prev.textContent = 'قبلی';
    prev.addEventListener('click', (e) => {
      e.stopPropagation();
      s.view = fromJ(j.y, j.m - 1, 1);
      renderCalendar(id);
    });

    const title = document.createElement('span');
    title.innerHTML = `<span class="monthName">${monthNames[j.m - 1]}</span> <span class="yearNumber">${j.y}</span>`;
    // month/year popups
    title.querySelector('.monthName').addEventListener('click', (e) => { e.stopPropagation(); showMonthPopup(id); });
    title.querySelector('.yearNumber').addEventListener('click', (e) => { e.stopPropagation(); showYearPopup(id); });

    const next = document.createElement('button');
    next.textContent = 'بعدی';
    next.addEventListener('click', (e) => {
      e.stopPropagation();
      s.view = fromJ(j.y, j.m + 1, 1);
      renderCalendar(id);
    });

    header.appendChild(prev);
    header.appendChild(title);
    header.appendChild(next);
    return header;
  }

  // ---- Table (future disabled; today disabled for start only; end >= start) ----
  function buildTable(id) {
    const s = state[id];
    const j = toJ(s.view);
    const first = fromJ(j.y, j.m, 1);
    const daysInMonth = jalaali.jalaaliMonthLength(j.y, j.m);

    const table = document.createElement('table');
    const thead = document.createElement('thead');
    const trh = document.createElement('tr');
    weekDays.forEach(d => {
      const th = document.createElement('th');
      th.textContent = d;
      trh.appendChild(th);
    });
    thead.appendChild(trh);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');

    // شنبه = 0
    let offset = (first.getDay() + 1) % 7;
    let curRow = document.createElement('tr');
    for (let i = 0; i < offset; i++) curRow.appendChild(document.createElement('td'));

    const today = new Date();

    for (let d = 1; d <= daysInMonth; d++) {
      const cell = document.createElement('td');
      const cellDate = fromJ(j.y, j.m, d);
      cell.textContent = d;

      if (sameJ(cellDate, today)) cell.classList.add('today');

      const isFuture = cellDate > today;
      const isToday = sameJ(cellDate, today);
      const violatesStartEnd = (id === 2 && state[1].selected && cellDate < state[1].selected);

      let clickable = true;
      if (violatesStartEnd) clickable = false; // end must be >= start
      if (isFuture) clickable = false;        // disable future dates
      if (id === 1 && isToday) clickable = false; // today disabled for start

      if (!clickable) {
        cell.classList.add('disabled');
      } else {
        cell.addEventListener('click', (e) => {
          e.stopPropagation();
          s.selected = cellDate;
          displayEls[id].textContent = formatJ(s.selected);
          removePopups(id);
          hideCalendar(id);
        });
      }

      curRow.appendChild(cell);
      if ((offset + d) % 7 === 0) {
        tbody.appendChild(curRow);
        curRow = document.createElement('tr');
      }
    }

    if (curRow.children.length) {
      while (curRow.children.length < 7) curRow.appendChild(document.createElement('td'));
      tbody.appendChild(curRow);
    }

    table.appendChild(tbody);
    return table;
  }

  function clearElement(el) { while (el.firstChild) el.removeChild(el.firstChild); }

  function renderCalendar(id) {
    const container = calEls[id];
    clearElement(container);

    // close bar
    const closeWrap = document.createElement('div');
    closeWrap.className = 'calendar-close-header';
    const closeBtn = document.createElement('button');
    closeBtn.className = id === 1 ? 'calendar-close-header-btn1' : 'calendar-close-header-btn2';
    closeBtn.innerHTML = '&times;';
    closeBtn.addEventListener('click', (e) => { e.stopPropagation(); hideCalendar(id); });
    closeWrap.appendChild(closeBtn);
    container.appendChild(closeWrap);

    container.appendChild(buildHeader(id));
    container.appendChild(buildTable(id));
  }

  function showCalendar(id) {
    removePopups(id);
    state[id].view = state[id].selected ? state[id].selected : new Date();
    renderCalendar(id);
    calEls[id].style.display = 'block';
  }
  function hideCalendar(id) {
    removePopups(id);
    calEls[id].style.display = 'none';
  }

  // ---- Launchers: only one calendar open at a time ----
 document.querySelectorAll('.showCalendar').forEach(btn => {
   btn.addEventListener('click', () => {
    const id = Number(btn.getAttribute('data-id'));
     const other = id === 1 ? 2 : 1;
      hideCalendar(other);
      showCalendar(id);
   });
 });

  // ---- Close on outside click (but NOT on popups or launcher buttons) ----
  document.addEventListener('click', (e) => {
    const clickedInside =
      [calEls[1], calEls[2]].some(el => el.contains(e.target)) ||
      e.target.classList.contains('showCalendar') ||
      e.target.closest('.month-popup') ||
      e.target.closest('.year-popup');
    if (!clickedInside) {
      hideCalendar(1);
      hideCalendar(2);
    }
  });

  // ---- Result & action buttons (parity with persianDate) ----
  const resultBox = document.getElementById('resultBox');
  const date1Text = document.getElementById('date1Text');
  const date2Text = document.getElementById('date2Text');

  document.getElementById('showResultBtn').addEventListener('click', () => {
    const d1 = state[1].selected;
    const d2 = state[2].selected;
    if (!d1 || !d2) return alert('لطفاً هر دو تاریخ را انتخاب کنید.');
    if (sameJ(d1, d2)) return alert('تاریخ‌ها نباید یکسان باشند.');
    if (d2 < d1) return alert('تاریخ پایان نباید قبل از شروع باشد.');

    date1Text.textContent = `تاریخ شروع: ${formatJ(d1)}`;
    date2Text.textContent = `تاریخ پایان: ${formatJ(d2)}`;
    resultBox.style.display = 'block';
  });

  document.getElementById('refreshBtn').addEventListener('click', () => {
    state[1].selected = null; state[2].selected = null;
    displayEls[1].textContent = ''; displayEls[2].textContent = '';
    resultBox.style.display = 'none';
    hideCalendar(1); hideCalendar(2);
  });

  document.getElementById('send').addEventListener('click', () => {
    state[1].selected = null; state[2].selected = null;
    displayEls[1].textContent = ''; displayEls[2].textContent = '';
    resultBox.style.display = 'none';
    hideCalendar(1); hideCalendar(2);
  });

  document.getElementById('removeselectdata').addEventListener('click', () => {
    state[1].selected = null; state[2].selected = null;
    displayEls[1].textContent = ''; displayEls[2].textContent = '';
    resultBox.style.display = 'none';
    // اگر یکی از تقویم‌ها باز بود، با وضعیت جدید رندرش کن
    if (calEls[1].style.display === 'block') renderCalendar(1);
    if (calEls[2].style.display === 'block') renderCalendar(2);
  });
})();
