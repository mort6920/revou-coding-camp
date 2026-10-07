/* =============================================
   LIFE DASHBOARD — app.js
   Windra's To-Do List Dashboard
   ============================================= */


/* =============================================
   SECTION 0: THEME TOGGLE
   (Challenge: Light / Original / Dark mode)
   ============================================= */

const THEME_KEY   = 'dashboard_theme';
const themeBtns   = document.querySelectorAll('.theme-btn');

// Terapkan tema ke <body> dan tandai tombol aktif
function applyTheme(theme) {
  // Hapus semua class tema dulu
  document.body.classList.remove('theme-light', 'theme-dark');

  // Tambahkan class sesuai pilihan
  if (theme === 'light') {
    document.body.classList.add('theme-light');
  } else if (theme === 'dark') {
    document.body.classList.add('theme-dark');
  }
  // 'original' → tidak perlu class, pakai :root default

  // Tandai tombol yang aktif
  themeBtns.forEach(function (btn) {
    btn.classList.toggle('active', btn.dataset.theme === theme);
  });

  // Simpan pilihan ke localStorage
  localStorage.setItem(THEME_KEY, theme);
}

// Pasang event listener ke tiap tombol tema
themeBtns.forEach(function (btn) {
  btn.addEventListener('click', function () {
    applyTheme(btn.dataset.theme);
  });
});

// Baca tema tersimpan, default ke 'original'
const savedTheme = localStorage.getItem(THEME_KEY) || 'original';
applyTheme(savedTheme);


/* =============================================
   SECTION 1: CLOCK & GREETING
   Timezone: WIB (Asia/Jakarta, UTC+7)
   ============================================= */

// Ambil elemen dari HTML
const timeEl    = document.getElementById('current-time');
const dateEl    = document.getElementById('current-date');
const greetEl   = document.getElementById('greeting-text');

// Nama custom (Challenge: Custom name in greeting)
const userName  = 'Capt';

// Format angka jadi selalu 2 digit, misal: 9 → "09"
function padTwo(num) {
  return String(num).padStart(2, '0');
}

// Update jam, tanggal, dan greeting setiap detik
function updateClock() {
  // Timezone WIB — Asia/Jakarta (UTC+7)
  const now = new Date();

  // Jam dalam WIB — format HH:MM:SS
  const timeOptions = {
    timeZone : 'Asia/Jakarta',
    hour     : '2-digit',
    minute   : '2-digit',
    second   : '2-digit',
    hour12   : false
  };
  timeEl.textContent = now.toLocaleTimeString('en-GB', timeOptions);

  // Tanggal dalam WIB — format: Tuesday, January 27, 2026
  const dateOptions = {
    timeZone : 'Asia/Jakarta',
    weekday  : 'long',
    year     : 'numeric',
    month    : 'long',
    day      : 'numeric'
  };
  dateEl.textContent = now.toLocaleDateString('en-US', dateOptions);

  // Ambil jam WIB untuk menentukan greeting
  const wibHour = parseInt(
    now.toLocaleString('en-US', { timeZone: 'Asia/Jakarta', hour: 'numeric', hour12: false }),
    10
  );

  let greeting;
  if (wibHour >= 5 && wibHour < 12) {
    greeting = 'Good Morning';
  } else if (wibHour >= 12 && wibHour < 17) {
    greeting = 'Good Afternoon';
  } else if (wibHour >= 17 && wibHour < 21) {
    greeting = 'Good Evening';
  } else {
    greeting = 'Good Night';
  }

  // Tampilkan greeting + nama (Challenge: Custom name)
  greetEl.textContent = `${greeting}, ${userName} 👋`;
}

// Jalankan sekali langsung, lalu setiap 1 detik
updateClock();
setInterval(updateClock, 1000);


/* =============================================
   SECTION 2: FOCUS TIMER
   (Challenge: Change Pomodoro time)
   ============================================= */

const timerDisplay   = document.getElementById('timer-display');
const btnStart       = document.getElementById('btn-start');
const btnStop        = document.getElementById('btn-stop');
const btnReset       = document.getElementById('btn-reset');
const customMinutes  = document.getElementById('custom-minutes');
const btnSetTimer    = document.getElementById('btn-set-timer');

// State timer
let timerDuration    = 25 * 60;   // detik, default 25 menit
let timeLeft         = timerDuration;
let timerInterval    = null;
let timerRunning     = false;

// Tampilkan waktu dalam format MM:SS
function renderTimer() {
  const m = padTwo(Math.floor(timeLeft / 60));
  const s = padTwo(timeLeft % 60);
  timerDisplay.textContent = `${m}:${s}`;
}

// Mulai timer
function startTimer() {
  if (timerRunning) return;   // jangan dobel jalan
  timerRunning = true;

  timerInterval = setInterval(function () {
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      timerRunning = false;
      timerDisplay.textContent = 'Done!';
      return;
    }
    timeLeft--;
    renderTimer();
  }, 1000);
}

// Stop / pause timer
function stopTimer() {
  clearInterval(timerInterval);
  timerRunning = false;
}

// Reset ke durasi awal
function resetTimer() {
  stopTimer();
  timeLeft = timerDuration;
  renderTimer();
}

// Challenge: ganti durasi timer
function setCustomTimer() {
  const val = parseInt(customMinutes.value, 10);

  // Validasi input
  if (isNaN(val) || val < 1 || val > 60) {
    alert('Please enter a number between 1 and 60.');
    return;
  }

  stopTimer();
  timerDuration = val * 60;
  timeLeft      = timerDuration;
  renderTimer();
}

// Event listener tombol timer
btnStart.addEventListener('click', startTimer);
btnStop.addEventListener('click', stopTimer);
btnReset.addEventListener('click', resetTimer);
btnSetTimer.addEventListener('click', setCustomTimer);

// Tampilkan timer awal
renderTimer();


/* =============================================
   SECTION 3: TASKS
   (Add, Delete, Mark done, Save localStorage)
   (Challenge: Sort tasks)
   ============================================= */

const taskForm   = document.getElementById('task-form');
const taskInput  = document.getElementById('task-input');
const taskListEl = document.getElementById('task-list');
const sortSelect = document.getElementById('sort-select');

// Kunci untuk localStorage
const TASKS_KEY  = 'dashboard_tasks';

// Baca tasks dari localStorage, kalau kosong pakai array []
function loadTasks() {
  const raw = localStorage.getItem(TASKS_KEY);
  return raw ? JSON.parse(raw) : [];
}

// Simpan tasks ke localStorage
function saveTasks(tasks) {
  localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
}

// Render ulang seluruh daftar task ke DOM
function renderTasks() {
  const tasks      = loadTasks();
  const sortMode   = sortSelect.value;

  // Buat salinan untuk di-sort, jangan ubah urutan asli di storage
  let sorted = [...tasks];

  if (sortMode === 'az') {
    sorted.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sortMode === 'za') {
    sorted.sort((a, b) => b.name.localeCompare(a.name));
  } else if (sortMode === 'done') {
    // Task yang belum done muncul dulu
    sorted.sort((a, b) => Number(a.done) - Number(b.done));
  }
  // sortMode === 'default' → urutan asli dari storage

  // Kosongkan dulu sebelum di-render ulang
  taskListEl.innerHTML = '';

  if (sorted.length === 0) {
    taskListEl.innerHTML = '<li style="color:#7777aa; font-size:0.9rem; padding: 4px 0;">No tasks yet. Add one above!</li>';
    return;
  }

  sorted.forEach(function (task) {
    const li = document.createElement('li');
    li.className = 'task-item' + (task.done ? ' done' : '');

    // Checkbox
    const checkbox      = document.createElement('input');
    checkbox.type       = 'checkbox';
    checkbox.checked    = task.done;
    checkbox.setAttribute('aria-label', `Mark "${task.name}" as done`);

    // Toggle done ketika checkbox diklik
    checkbox.addEventListener('change', function () {
      const tasks  = loadTasks();
      const target = tasks.find(t => t.id === task.id);
      if (target) {
        target.done = checkbox.checked;
        saveTasks(tasks);
        renderTasks();
      }
    });

    // Nama task
    const span       = document.createElement('span');
    span.className   = 'task-name';
    span.textContent = task.name;

    // Tombol Edit
    const btnEdit      = document.createElement('button');
    btnEdit.className  = 'btn-edit-task';
    btnEdit.textContent = 'Edit';
    btnEdit.setAttribute('aria-label', `Edit task "${task.name}"`);

    btnEdit.addEventListener('click', function () {
      // Ganti span teks dengan input yang bisa diketik
      const input      = document.createElement('input');
      input.type       = 'text';
      input.className  = 'task-edit-input';
      input.value      = task.name;
      input.setAttribute('aria-label', 'Edit task name');

      // Tombol Save untuk konfirmasi edit
      const btnSave      = document.createElement('button');
      btnSave.className  = 'btn-save-task';
      btnSave.textContent = 'Save';

      // Fungsi simpan hasil edit
      function saveEdit() {
        const newName = input.value.trim();
        if (!newName) return;         // jangan simpan kalau kosong
        const tasks  = loadTasks();
        const target = tasks.find(t => t.id === task.id);
        if (target) {
          target.name = newName;
          saveTasks(tasks);
          renderTasks();
        }
      }

      // Klik Save → simpan
      btnSave.addEventListener('click', saveEdit);

      // Tekan Enter di input → simpan
      input.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') saveEdit();
        if (e.key === 'Escape') renderTasks();  // batal edit
      });

      // Swap: ganti span + tombol Edit dengan input + tombol Save
      li.replaceChild(input, span);
      li.replaceChild(btnSave, btnEdit);
      input.focus();
      input.select();   // langsung pilih semua teks supaya mudah diubah
    });

    // Tombol Delete
    const btnDel      = document.createElement('button');
    btnDel.className  = 'btn-delete-task';
    btnDel.textContent = 'Delete';
    btnDel.setAttribute('aria-label', `Delete task "${task.name}"`);

    btnDel.addEventListener('click', function () {
      let tasks   = loadTasks();
      tasks       = tasks.filter(t => t.id !== task.id);
      saveTasks(tasks);
      renderTasks();
    });

    li.appendChild(checkbox);
    li.appendChild(span);
    li.appendChild(btnEdit);
    li.appendChild(btnDel);
    taskListEl.appendChild(li);
  });
}

// Tambah task baru ketika form di-submit
taskForm.addEventListener('submit', function (e) {
  e.preventDefault();   // cegah reload halaman

  const name = taskInput.value.trim();
  if (!name) return;    // jangan tambah task kosong

  const tasks = loadTasks();

  // Buat objek task baru
  const newTask = {
    id   : Date.now(),  // ID unik berdasarkan timestamp
    name : name,
    done : false
  };

  tasks.push(newTask);
  saveTasks(tasks);
  renderTasks();

  // Kosongkan input setelah tambah
  taskInput.value = '';
  taskInput.focus();
});

// Re-render ketika sort option berubah
sortSelect.addEventListener('change', renderTasks);

// Render tasks saat halaman pertama kali dibuka
renderTasks();


/* =============================================
   SECTION 4: QUICK LINKS
   (Add, Delete, Open URL, Save localStorage)
   ============================================= */

const linkForm   = document.getElementById('link-form');
const linkNameEl = document.getElementById('link-name');
const linkUrlEl  = document.getElementById('link-url');
const linkListEl = document.getElementById('link-list');

// Kunci untuk localStorage
const LINKS_KEY  = 'dashboard_links';

// Baca links dari localStorage
function loadLinks() {
  const raw = localStorage.getItem(LINKS_KEY);
  return raw ? JSON.parse(raw) : [];
}

// Simpan links ke localStorage
function saveLinks(links) {
  localStorage.setItem(LINKS_KEY, JSON.stringify(links));
}

// Pastikan URL punya protokol (misal user ketik "google.com" tanpa https://)
function normalizeUrl(url) {
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return 'https://' + url;
  }
  return url;
}

// Render ulang semua link ke DOM
function renderLinks() {
  const links = loadLinks();

  linkListEl.innerHTML = '';

  if (links.length === 0) {
    linkListEl.innerHTML = '<span style="color:#7777aa; font-size:0.9rem;">No links yet. Add one above!</span>';
    return;
  }

  links.forEach(function (link) {
    // Wrapper item
    const div       = document.createElement('div');
    div.className   = 'link-item';
    div.setAttribute('role', 'listitem');

    // Tautan yang bisa diklik
    const a         = document.createElement('a');
    a.textContent   = link.name;
    a.href          = link.url;
    a.target        = '_blank';                // buka di tab baru
    a.rel           = 'noopener noreferrer';   // keamanan
    a.setAttribute('aria-label', `Open ${link.name}`);

    // Tombol X untuk hapus
    const btnDel      = document.createElement('button');
    btnDel.className  = 'btn-delete-link';
    btnDel.textContent = '×';
    btnDel.setAttribute('aria-label', `Remove ${link.name}`);

    btnDel.addEventListener('click', function () {
      let links = loadLinks();
      links     = links.filter(l => l.id !== link.id);
      saveLinks(links);
      renderLinks();
    });

    div.appendChild(a);
    div.appendChild(btnDel);
    linkListEl.appendChild(div);
  });
}

// Tambah link baru ketika form di-submit
linkForm.addEventListener('submit', function (e) {
  e.preventDefault();

  const name = linkNameEl.value.trim();
  const url  = linkUrlEl.value.trim();

  if (!name || !url) return;   // jangan tambah kalau ada yang kosong

  const links   = loadLinks();
  const newLink = {
    id   : Date.now(),
    name : name,
    url  : normalizeUrl(url)
  };

  links.push(newLink);
  saveLinks(links);
  renderLinks();

  // Kosongkan input
  linkNameEl.value = '';
  linkUrlEl.value  = '';
  linkNameEl.focus();
});

// Render links saat halaman pertama kali dibuka
renderLinks();
