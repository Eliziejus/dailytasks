import { auth, onAuthStateChanged, signInWithEmailAndPassword } from "./firebase.js";
import { signInWithGoogle, isBenignPopupError } from "./google-auth.js";

const form = document.getElementById("login-form");
const emailInput = document.getElementById("login-email-input");
const passwordInput = document.getElementById("login-password-input");
const errorEl = document.getElementById("login-form-error");
const submitBtn = document.getElementById("login-submit-btn");
const googleBtn = document.getElementById("google-signin-btn");

// Already signed in? Skip straight to the planner.
onAuthStateChanged(auth, (user) => {
  if (user) window.location.replace("index.html");
});

function showError(message) {
  errorEl.textContent = message;
  errorEl.hidden = false;
}

function hideError() {
  errorEl.hidden = true;
}

function messageForError(err) {
  switch (err.code) {
    case "auth/invalid-email":
      return "Enter a valid email address.";
    case "auth/user-disabled":
      return "This account has been disabled.";
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Incorrect email or password.";
    case "auth/too-many-requests":
      return "Too many attempts. Please wait a moment and try again.";
    case "auth/account-exists-with-different-credential":
      return "An account with this email already exists using a different sign-in method.";
    default:
      return "Something went wrong. Please try again.";
  }
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  hideError();

  const email = emailInput.value.trim();
  const password = passwordInput.value;

  if (!email || !password) {
    showError("Email and password are required.");
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = "Logging in…";

  try {
    await signInWithEmailAndPassword(auth, email, password);
    window.location.replace("index.html");
  } catch (err) {
    showError(messageForError(err));
    submitBtn.disabled = false;
    submitBtn.textContent = "Log In";
  }
});

googleBtn.addEventListener("click", async () => {
  hideError();
  googleBtn.disabled = true;

  try {
    await signInWithGoogle();
    window.location.replace("index.html");
  } catch (err) {
    if (!isBenignPopupError(err)) {
      showError(messageForError(err));
    }
    googleBtn.disabled = false;
  }
});
