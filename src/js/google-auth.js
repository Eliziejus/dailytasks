import { auth, GoogleAuthProvider, signInWithPopup } from "./firebase.js";

export function signInWithGoogle() {
  return signInWithPopup(auth, new GoogleAuthProvider());
}

export function isBenignPopupError(err) {
  return err.code === "auth/popup-closed-by-user" || err.code === "auth/cancelled-popup-request";
}
