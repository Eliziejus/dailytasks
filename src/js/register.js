import { auth, onAuthStateChanged, createUserWithEmailAndPassword } from "./firebase.js";

const form = document.getElementById("register-form");
const emailInput = document.getElementById("register-email-input");
const passwordInput = document.getElementById("register-password-input");
const confirmInput = document.getElementById("register-confirm-input");
const errorEl = document.getElementById("register-form-error");
const submitBtn = document.getElementById("register-submit-btn");

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
    case "auth/email-already-in-use":
      return "An account with this email already exists.";
    case "auth/weak-password":
      return "Password must be at least 6 characters.";
    default:
      return "Something went wrong. Please try again.";
  }
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  hideError();

  const email = emailInput.value.trim();
  const password = passwordInput.value;
  const confirm = confirmInput.value;

  if (!email || !password || !confirm) {
    showError("All fields are required.");
    return;
  }

  if (password.length < 6) {
    showError("Password must be at least 6 characters.");
    return;
  }

  if (password !== confirm) {
    showError("Passwords do not match.");
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = "Registering…";

  try {
    await createUserWithEmailAndPassword(auth, email, password);
    window.location.replace("index.html");
  } catch (err) {
    showError(messageForError(err));
    submitBtn.disabled = false;
    submitBtn.textContent = "Register";
  }
});
