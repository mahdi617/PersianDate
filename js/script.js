let selectedDates = {1: null, 2: null};

function initCalendar(buttonId) {
  const calendarDiv = document.getElementById("calendar" + buttonId);
  // calendarDiv.innerHTML = '';
  calendarDiv.style.display = 'block';

function handleClickOutside(event) {
  const isInsideCalendar = calendarDiv.contains(event.target);
  const isMonthPopup = event.target.closest('.month-popup');
  const isYearPopup = event.target.closest('.year-popup');
  const isCalendarButton = event.target.classList.contains('showCalendar');

  if (!isInsideCalendar && !isMonthPopup && !isYearPopup && !isCalendarButton) {
    calendarDiv.innerHTML = '';
    calendarDiv.style.display = 'none';
    document.removeEventListener('click', handleClickOutside);
  }
}



  let currentDate = new persianDate();
  let today = new persianDate();

  function renderCalendar() {
    calendarDiv.innerHTML = '';
    const year = currentDate.year();
    const month = currentDate.month();
    const start = new persianDate([year, month, 1]);
    const end = new persianDate([year, month + 1, 1]).subtract('days', 1);
    const startDay = start.day();
    const daysInMonth = end.date();

    const closeheader =document.createElement('div')
    closeheader.classList.add('calendar-close-header')
    const closeheaderbtn=document.createElement('button')
    if(buttonId==1){
      closeheaderbtn.classList.add('calendar-close-header-btn1')
    }else{
      closeheaderbtn.classList.add('calendar-close-header-btn2')
    }
    closeheaderbtn.innerHTML=`<i class="ri-close-line"></i>`

    const header = document.createElement('div');
    header.classList.add('calendar-header');

    const prevBtn = document.createElement('button');
    prevBtn.textContent = 'قبلی';
    prevBtn.onclick = () => {
      currentDate = currentDate.subtract('month', 1);
      renderCalendar();
    };

    const title = document.createElement('div');
    title.innerHTML = `<span class="monthName">${start.format('MMMM')}</span> <span class="yearNumber">${year}</span>`;

    const nextBtn = document.createElement('button');
    nextBtn.textContent = 'بعدی';
    nextBtn.onclick = () => {
      currentDate = currentDate.add('month', 1);
      renderCalendar();
    };

    header.appendChild(prevBtn);
    header.appendChild(title);
    header.appendChild(nextBtn);
    closeheader.appendChild(closeheaderbtn)
    closeheaderbtn.addEventListener('click', () => {
     calendarDiv.innerHTML = '';
      calendarDiv.style.display = 'none'; 
     });

    calendarDiv.appendChild(closeheader)
    calendarDiv.appendChild(header);

    const table = document.createElement('table');
    const daysRow = document.createElement('tr');
    ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'].forEach(d => {
      const th = document.createElement('th');
      th.textContent = d;
      daysRow.appendChild(th);
    });
    table.appendChild(daysRow);

    let row = document.createElement('tr');
    for (let i = 0; i < (startDay === 7 ? 0 : startDay); i++) {
      row.appendChild(document.createElement('td'));
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const date = new persianDate([year, month, d]);
      const td = document.createElement('td');
      td.textContent = d;

     if (date.format('YYYYMMDD') === today.format('YYYYMMDD')) {
       td.classList.add('today');
        if (buttonId == 1) {
         td.classList.add('disabled');
        } else {
          td.addEventListener('click', () => {
          selectedDates[buttonId] = date;
          document.getElementById('displayDate' + buttonId).textContent = date.format('YYYY/MM/DD');
          calendarDiv.style.display = 'none';
           });
        }
     } else if (date.unix() > today.unix()) {
        td.classList.add('disabled');
       } else {
         td.addEventListener('click', () => {
          selectedDates[buttonId] = date;
         document.getElementById('displayDate' + buttonId).textContent = date.format('YYYY/MM/DD');
          calendarDiv.style.display = 'none';
         });
        }

      row.appendChild(td);
      if (row.children.length === 7) {
        table.appendChild(row);
        row = document.createElement('tr');
      }
    }

    if (row.children.length) table.appendChild(row);
    calendarDiv.appendChild(table);

    title.querySelector('.monthName').onclick = () => showMonthPopup(year);
    title.querySelector('.yearNumber').onclick = () => showYearPopup(year);
  }

  function showMonthPopup(currentYear) {
    const popup = document.createElement('div');
    popup.classList.add('month-popup');

    const monthNames = ['فروردین','اردیبهشت','خرداد','تیر','مرداد','شهریور','مهر','آبان','آذر','دی','بهمن','اسفند'];
    for (let i = 0; i < 12; i++) {
      const div = document.createElement('div');
      div.textContent = monthNames[i];
      div.addEventListener('click', () => {
        currentDate = new persianDate([currentYear, i + 1, 1]);
        renderCalendar();
      });
      popup.appendChild(div);
    }

    removePopups();
    calendarDiv.appendChild(popup);
  }

  function showYearPopup(currentYear) {
    const popup = document.createElement('div');
    popup.classList.add('year-popup');

    for (let i = currentYear - 6; i <= currentYear + 5; i++) {
      const div = document.createElement('div');
      div.textContent = i;
      div.addEventListener('click', () => {
        currentDate = new persianDate([i, currentDate.month(), 1]);
        renderCalendar();
      });
      popup.appendChild(div);
    }

    removePopups();
    calendarDiv.appendChild(popup);
  }

  function removePopups() {
    calendarDiv.querySelectorAll('.month-popup, .year-popup').forEach(el => el.remove());
  }
  
  renderCalendar();


}

document.querySelectorAll('.showCalendar').forEach(btn => {
  btn.addEventListener('click', () => {
    const id = btn.dataset.id;
    initCalendar(id);
  });
});

document.getElementById('showResultBtn').addEventListener('click', () => {
  const d1 = selectedDates[1];
  const d2 = selectedDates[2];
  if (!d1 || !d2) return alert('لطفاً هر دو تاریخ را انتخاب کنید.');
  if (d1.format('YYYYMMDD') === d2.format('YYYYMMDD')) return alert('تاریخ‌ها نباید یکسان باشند.');
  if (d2.unix() < d1.unix()) return alert('تاریخ پایان نباید قبل از شروع باشد.');

  document.getElementById('date1Text').textContent = 'تاریخ شروع: ' + d1.format('YYYY/MM/DD');
  document.getElementById('date2Text').textContent = 'تاریخ پایان: ' + d2.format('YYYY/MM/DD');
  document.getElementById('resultBox').style.display = 'block';
});

document.getElementById('refreshBtn').addEventListener('click', () => {
  selectedDates = {1: null, 2: null};
  document.getElementById('displayDate1').textContent = '';
  document.getElementById('displayDate2').textContent = '';
  document.getElementById('resultBox').style.display = 'none';
});

document.getElementById('send').addEventListener('click', () => {
  selectedDates = {1: null, 2: null};
  document.getElementById('displayDate1').textContent = '';
  document.getElementById('displayDate2').textContent = '';
  document.getElementById('resultBox').style.display = 'none';
});

document.getElementById('removeselectdata').addEventListener('click', () => {
  document.getElementById('displayDate1').textContent = '';
  document.getElementById('displayDate2').textContent = '';
  selectedDates={}
  
});