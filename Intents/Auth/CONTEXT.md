# Auth

> Owner: Eliziejus  ·  Created: 2026-08-20

## Begin (raw)
<!-- 3-minute brain dump. Do not edit or reinterpret. -->

I want login and register pages with auth.

## Refine (scope)
- **Goal**: Add login and register pages so the Daily Planner requires a signed-in user before it can be used. Auth is handled by Firebase Auth (email/password) so the site stays a static, buildless deployment.
- **In / Out of scope**: In — `login.html` and `register.html` pages, Firebase Auth SDK wired via CDN `<script type="module">`, route-guard on the existing planner (`index.html`) that redirects to login when signed out, a logout action, form validation and error messages, styling consistent with the existing planner. Out — per-user cloud sync of tasks (tasks remain per-browser in `localStorage`, unchanged from the DailyPlanner intent), social login providers, password reset flow, email verification, roles/permissions.
- **Definition of Done**: A signed-out visitor hitting `index.html` is redirected to `login.html`. A new visitor can register an account on `register.html` and is signed in afterward. A returning user can log in on `login.html`. A signed-in user can log out from the planner. Auth state persists across a page reload (Firebase's default session persistence). Tasks continue to work exactly as before, still scoped to the browser's `localStorage`, not the account.
- **Constraints**: No backend, no build step (per root `CONTEXT.md`) — Firebase Auth loaded via CDN ES modules, no npm/bundler introduced. Deployable as a static site. The user must create their own free Firebase project and supply the web config (apiKey, authDomain, etc.) in `src/js/firebase-config.js` — Claude cannot create third-party accounts or credentials.
- **Risks**: Firebase web config values are safe to commit (Firebase does not treat them as secrets — access is controlled by Firebase Security Rules / Auth settings, not by hiding the config), but the app cannot be end-to-end tested until the user provides real project values. Manual QA against a live Firebase project is a follow-up the user owns.
- **Resources**: https://firebase.google.com/docs/auth/web/password-auth
- **Dependencies**: DailyPlanner (existing `index.html` / `app.js` / `styles.css`) is the app being gated.
