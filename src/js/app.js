// Daily Planner — app entry point
import { auth, onAuthStateChanged } from "./firebase.js";
import { subscribeToTasks, addTask, updateTask, deleteTask, migrateLocalTasksIfNeeded } from "./tasks-repo.js";

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

// date key ("YYYY-MM-DD") -> array of { id, title, time, notes, done }, kept in sync from Firestore
let tasksByDate = {};
let currentUid = null;
let unsubscribeTasks = null;

function groupByDate(tasks) {
  const grouped = {};
  for (const task of tasks) {
    if (!grouped[task.date]) grouped[task.date] = [];
    grouped[task.date].push(task);
  }
  return grouped;
}

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

  const headerRow = document.createElement("div");
  headerRow.className = "day-detail-header";

  const heading = document.createElement("h2");
  heading.className = "day-detail-heading";
  heading.textContent = formatDisplayDate(state.selectedDate);

  const addBtn = document.createElement("button");
  addBtn.type = "button";
  addBtn.className = "add-task-btn";
  addBtn.id = "add-task-btn";
  addBtn.textContent = "+ Add task";
  addBtn.addEventListener("click", () => openTaskDialog(null));

  headerRow.append(heading, addBtn);
  container.appendChild(headerRow);

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
    checkbox.setAttribute("aria-label", `Mark "${task.title}" as ${task.done ? "not done" : "done"}`);
    checkbox.addEventListener("change", () => {
      updateTask(currentUid, task.id, { done: checkbox.checked }).catch((err) => {
        console.error("Failed to update task:", err);
        checkbox.checked = !checkbox.checked;
        showSyncError("Failed to update task. Please try again.");
      });
    });

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

    const actions = document.createElement("div");
    actions.className = "task-actions";

    const editBtn = document.createElement("button");
    editBtn.type = "button";
    editBtn.className = "task-edit-btn";
    editBtn.textContent = "Edit";
    editBtn.setAttribute("aria-label", `Edit "${task.title}"`);
    editBtn.addEventListener("click", () => openTaskDialog(task));

    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.className = "task-delete-btn";
    deleteBtn.textContent = "Delete";
    deleteBtn.setAttribute("aria-label", `Delete "${task.title}"`);
    deleteBtn.addEventListener("click", () => {
      if (!window.confirm(`Delete "${task.title}"?`)) return;
      deleteTask(currentUid, task.id).catch((err) => {
        console.error("Failed to delete task:", err);
        showSyncError("Failed to delete task. Please try again.");
      });
    });

    actions.append(editBtn, deleteBtn);
    item.append(checkbox, content, actions);
    list.appendChild(item);
  }

  container.appendChild(list);
}

// --- Task add/edit dialog ---

let editingTaskId = null;

const taskDialog = document.getElementById("task-dialog");
const taskForm = document.getElementById("task-form");
const taskDialogTitle = document.getElementById("task-dialog-title");
const taskTitleInput = document.getElementById("task-title-input");
const taskTimeInput = document.getElementById("task-time-input");
const taskNotesInput = document.getElementById("task-notes-input");
const taskFormError = document.getElementById("task-form-error");
const taskCancelBtn = document.getElementById("task-cancel-btn");
const taskSaveBtn = document.getElementById("task-save-btn");

function openTaskDialog(task) {
  editingTaskId = task ? task.id : null;
  taskDialogTitle.textContent = task ? "Edit Task" : "Add Task";
  taskTitleInput.value = task ? task.title : "";
  taskTimeInput.value = task ? task.time || "" : "";
  taskNotesInput.value = task ? task.notes || "" : "";
  taskFormError.hidden = true;
  taskDialog.showModal();
  taskTitleInput.focus();
}

function closeTaskDialog() {
  taskDialog.close();
  taskForm.reset();
  editingTaskId = null;
}

taskCancelBtn.addEventListener("click", () => {
  closeTaskDialog();
});

taskForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const title = taskTitleInput.value.trim();
  if (!title) {
    taskFormError.textContent = "Title is required.";
    taskFormError.hidden = false;
    taskTitleInput.focus();
    return;
  }

  const payload = {
    title,
    time: taskTimeInput.value,
    notes: taskNotesInput.value.trim(),
    date: state.selectedDate,
  };

  taskSaveBtn.disabled = true;

  try {
    if (editingTaskId) {
      await updateTask(currentUid, editingTaskId, payload);
    } else {
      await addTask(currentUid, payload);
    }
    closeTaskDialog();
  } catch (err) {
    taskFormError.textContent = "Failed to save. Please try again.";
    taskFormError.hidden = false;
  } finally {
    taskSaveBtn.disabled = false;
  }
});

// --- Loading / sync error states ---

const syncErrorEl = document.getElementById("sync-error");

function showSyncError(message) {
  syncErrorEl.textContent = message;
  syncErrorEl.hidden = false;
}

function hideSyncError() {
  syncErrorEl.hidden = true;
}

// Reveals the planner. Called once the first batch of tasks has actually
// loaded (or loading has definitively failed) — not just once auth resolves —
// so there's no flash of an empty task list between sign-in and first data.
function stopLoading() {
  document.body.removeAttribute("data-auth-pending");
}

// --- Firestore subscription, driven by auth state ---

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    if (unsubscribeTasks) {
      unsubscribeTasks();
      unsubscribeTasks = null;
    }
    return;
  }

  currentUid = user.uid;

  try {
    await migrateLocalTasksIfNeeded(currentUid);
  } catch (err) {
    console.error("Failed to migrate local tasks:", err);
  }

  if (unsubscribeTasks) unsubscribeTasks();
  unsubscribeTasks = subscribeToTasks(
    currentUid,
    (tasks) => {
      hideSyncError();
      tasksByDate = groupByDate(tasks);
      renderWeekStrip();
      renderDayDetail();
      stopLoading();
    },
    (err) => {
      console.error("Failed to load tasks:", err);
      showSyncError("Failed to load tasks. Check your connection and try reloading.");
      stopLoading();
    }
  );
});
