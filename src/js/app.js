// Daily Planner — app entry point

const state = {
  weekStart: getMonday(new Date()),
  selectedDate: dateKey(new Date()),
};

function getMonday(date) {
  const d = new Date(date);
  const day = d.getDay(); // 0 = Sunday, 1 = Monday, ...
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

function dateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const FULL_WEEKDAY_LABELS = [
  "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday",
];
const MONTH_LABELS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function formatDisplayDate(key) {
  const [y, m, d] = key.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return `${FULL_WEEKDAY_LABELS[date.getDay()]}, ${MONTH_LABELS[date.getMonth()]} ${date.getDate()}`;
}

// date key ("YYYY-MM-DD") -> array of { id, title, time, notes, done }
let tasksByDate = {};

function getTasksForDate(key) {
  return tasksByDate[key] || [];
}

function sortedTasks(tasks) {
  return [...tasks].sort((a, b) => {
    if (!a.time && !b.time) return 0;
    if (!a.time) return 1;
    if (!b.time) return -1;
    return a.time.localeCompare(b.time);
  });
}

function renderWeekStrip() {
  const container = document.getElementById("week-strip");
  container.innerHTML = "";

  const nav = document.createElement("div");
  nav.className = "week-nav";

  const prevBtn = document.createElement("button");
  prevBtn.type = "button";
  prevBtn.id = "week-prev";
  prevBtn.className = "week-nav-btn";
  prevBtn.textContent = "‹";
  prevBtn.setAttribute("aria-label", "Previous week");
  prevBtn.addEventListener("click", () => {
    state.weekStart = addDays(state.weekStart, -7);
    renderWeekStrip();
  });

  const label = document.createElement("span");
  label.className = "week-label";
  const weekEnd = addDays(state.weekStart, 6);
  label.textContent =
    weekEnd.getMonth() === state.weekStart.getMonth()
      ? `${MONTH_LABELS[state.weekStart.getMonth()]} ${state.weekStart.getFullYear()}`
      : `${MONTH_LABELS[state.weekStart.getMonth()]} – ${MONTH_LABELS[weekEnd.getMonth()]} ${weekEnd.getFullYear()}`;

  const nextBtn = document.createElement("button");
  nextBtn.type = "button";
  nextBtn.id = "week-next";
  nextBtn.className = "week-nav-btn";
  nextBtn.textContent = "›";
  nextBtn.setAttribute("aria-label", "Next week");
  nextBtn.addEventListener("click", () => {
    state.weekStart = addDays(state.weekStart, 7);
    renderWeekStrip();
  });

  nav.append(prevBtn, label, nextBtn);

  const days = document.createElement("div");
  days.className = "week-days";

  for (let i = 0; i < 7; i++) {
    const date = addDays(state.weekStart, i);
    const key = dateKey(date);

    const dayBtn = document.createElement("button");
    dayBtn.type = "button";
    dayBtn.className = "day-btn";
    dayBtn.dataset.date = key;
    dayBtn.setAttribute("aria-pressed", String(key === state.selectedDate));
    if (key === state.selectedDate) dayBtn.classList.add("selected");
    if (key === dateKey(new Date())) dayBtn.classList.add("today");

    const weekdayEl = document.createElement("span");
    weekdayEl.className = "day-weekday";
    weekdayEl.textContent = WEEKDAY_LABELS[i];

    const numEl = document.createElement("span");
    numEl.className = "day-number";
    numEl.textContent = String(date.getDate());

    dayBtn.append(weekdayEl, numEl);
    dayBtn.addEventListener("click", () => {
      state.selectedDate = key;
      renderWeekStrip();
      renderDayDetail();
    });

    days.appendChild(dayBtn);
  }

  container.append(nav, days);
}

function renderDayDetail() {
  const container = document.getElementById("day-detail");
  container.innerHTML = "";

  const heading = document.createElement("h2");
  heading.className = "day-detail-heading";
  heading.textContent = formatDisplayDate(state.selectedDate);
  container.appendChild(heading);

  const tasks = sortedTasks(getTasksForDate(state.selectedDate));

  if (tasks.length === 0) {
    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.textContent = "No tasks for this day.";
    container.appendChild(empty);
    return;
  }

  const list = document.createElement("ul");
  list.className = "task-list";

  for (const task of tasks) {
    const item = document.createElement("li");
    item.className = "task-item" + (task.done ? " done" : "");
    item.dataset.taskId = task.id;

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "task-checkbox";
    checkbox.checked = !!task.done;

    const content = document.createElement("div");
    content.className = "task-content";

    const titleRow = document.createElement("div");
    titleRow.className = "task-title-row";

    const titleEl = document.createElement("span");
    titleEl.className = "task-title";
    titleEl.textContent = task.title;
    titleRow.appendChild(titleEl);

    if (task.time) {
      const timeEl = document.createElement("span");
      timeEl.className = "task-time";
      timeEl.textContent = task.time;
      titleRow.appendChild(timeEl);
    }

    content.appendChild(titleRow);

    if (task.notes) {
      const notesEl = document.createElement("p");
      notesEl.className = "task-notes";
      notesEl.textContent = task.notes;
      content.appendChild(notesEl);
    }

    item.append(checkbox, content);
    list.appendChild(item);
  }

  container.appendChild(list);
}

renderWeekStrip();
renderDayDetail();
