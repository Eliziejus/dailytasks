import { auth, onAuthStateChanged, signOut } from "./firebase.js";

const userInfo = document.getElementById("user-info");
const userEmailEl = document.getElementById("user-email");
const logoutBtn = document.getElementById("logout-btn");

onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.replace("login.html");
    return;
  }

  document.body.removeAttribute("data-auth-pending");
  userEmailEl.textContent = user.email;
  userInfo.hidden = false;
});

logoutBtn.addEventListener("click", async () => {
  await signOut(auth);
  window.location.replace("login.html");
});
