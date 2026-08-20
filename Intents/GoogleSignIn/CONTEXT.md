# GoogleSignIn

> Owner: Eliziejus  ·  Created: 2026-08-20

## Begin (raw)
<!-- 3-minute brain dump. Do not edit or reinterpret. -->

Good. CAn you add also sign with google?

## Refine (scope)
- **Goal**: Add "Continue with Google" as a second sign-in option alongside the existing email/password auth, using Firebase Auth's Google provider (`signInWithPopup` + `GoogleAuthProvider`) — no new backend, same Firebase project already wired up.
- **In / Out of scope**: In — a Google sign-in button on both `login.html` and `register.html` (Firebase treats a new Google account as an automatic sign-up, so one button covers both cases), wiring in `firebase.js`/`login.js`/`register.js`, popup-based flow (no redirect handling needed), error handling for a closed popup and for an email that already has a password-based account, Firebase console + README documentation for enabling the Google provider. Out — linking a Google identity to an existing password account (Firebase surfaces this as a distinct error today; merging accounts is a separate feature if ever needed), any other social providers (GitHub, Apple, etc.).
- **Definition of Done**: A visitor on `login.html` or `register.html` can click "Continue with Google," complete the Google popup, and land on the planner signed in — whether or not that Google account has used the app before. Declining/closing the popup returns the user to the page with no error spam. The existing email/password flow is untouched.
- **Constraints**: No backend — still a client-side Firebase Auth SDK call. The user must enable the Google provider in the Firebase console (Authentication → Sign-in method → Google) and set a support email — Claude cannot do this for them.
- **Risks**: Cannot be end-to-end tested without the user's real Firebase project having the Google provider enabled (same limitation as every other Firebase-dependent feature so far).
- **Resources**: https://firebase.google.com/docs/auth/web/google-signin
- **Dependencies**: Auth (login.html/register.html/firebase.js already exist).
