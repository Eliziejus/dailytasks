import { auth, onAuthStateChanged, signOut } from "./firebase.js";

const userInfo = document.getElementById("user-info");
const userEmailEl = document.getElementById("user-email");
const logoutBtn = document.getElementById("logout-btn");

onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.replace("login.html");
    return;
  }

  // Leaves `data-auth-pending` in place: app.js clears it once the first
  // batch of tasks has actually loaded, not just once auth has resolved.
  userEmailEl.textContent = user.email;
  userInfo.hidden = false;
});

logoutBtn.addEventListener("click", async () => {
  await signOut(auth);
  window.location.replace("login.html");
});
