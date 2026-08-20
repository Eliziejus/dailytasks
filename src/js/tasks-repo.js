import {
  db,
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
} from "./firebase.js";

function tasksCollection(uid) {
  return collection(db, "users", uid, "tasks");
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
