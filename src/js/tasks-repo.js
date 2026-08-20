import {
  db,
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  onSnapshot,
  writeBatch,
} from "./firebase.js";

const LOCAL_STORAGE_KEY = "dailyPlanner.tasksByDate";

function tasksCollection(uid) {
  return collection(db, "users", uid, "tasks");
}

function readLocalTasksByDate() {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

// One-time upload of any tasks already sitting in this browser's localStorage
// (from before cloud sync existed) into this account's Firestore tasks.
// Idempotent: marks users/{uid}.migratedFromLocalStorage so it never repeats,
// even if localStorage was empty or all migrated tasks are later deleted.
export async function migrateLocalTasksIfNeeded(uid) {
  const userRef = doc(db, "users", uid);
  const userSnap = await getDoc(userRef);
  if (userSnap.exists() && userSnap.data().migratedFromLocalStorage) return;

  const localTasksByDate = readLocalTasksByDate();

  const batch = writeBatch(db);
  for (const [date, tasks] of Object.entries(localTasksByDate)) {
    for (const task of tasks) {
      const taskRef = doc(tasksCollection(uid));
      batch.set(taskRef, {
        title: task.title,
        time: task.time || "",
        notes: task.notes || "",
        done: !!task.done,
        date,
      });
    }
  }
  batch.set(userRef, { migratedFromLocalStorage: true }, { merge: true });

  await batch.commit();
}

export function subscribeToTasks(uid, onChange, onError) {
  return onSnapshot(
    tasksCollection(uid),
    (snapshot) => {
      const tasks = snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
      onChange(tasks);
    },
    onError
  );
}

export function addTask(uid, { title, time, notes, date }) {
  return addDoc(tasksCollection(uid), { title, time, notes, date, done: false });
}

export function updateTask(uid, taskId, updates) {
  return updateDoc(doc(db, "users", uid, "tasks", taskId), updates);
}

export function deleteTask(uid, taskId) {
  return deleteDoc(doc(db, "users", uid, "tasks", taskId));
}
