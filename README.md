# Daily Planner

A simple website with a calendar and a daily task list.

## Getting Started

No build step required. Clone the repo and open `src/index.html` in a browser,
or serve `src/` with any static file server.

Live: https://eliziejus.github.io/dailytasks/ (deployed via GitHub Actions on every push to `main` — see `.github/workflows/deploy.yml`). Sign-in won't work there until this domain is added to Firebase's Authorized Domains and `src/js/firebase-config.js` has real project values — see "Setting up auth" below.

## Usage

- Register or log in with an email/password account.
- View the calendar and pick a day.
- Add, complete, and delete tasks for that day.
- Tasks are saved to your account in the cloud (Firestore) and sync live across every tab or device where you're signed in. If you used the app before cloud sync existed, any tasks already sitting in that browser are uploaded to your account automatically the first time you log in.

## Setting up auth

The planner is gated behind [Firebase Authentication](https://firebase.google.com/docs/auth). It's loaded via CDN as an ES module, so there's still no build step or npm install — you just need a free Firebase project:

1. Go to the [Firebase Console](https://console.firebase.google.com/) and create a new project (or reuse an existing one).
2. In the project, go to **Build → Authentication → Sign-in method** and enable the **Email/Password** provider.
3. Go to **Project settings → General → Your apps**, add a **Web app**, and copy the `firebaseConfig` object it gives you.
4. Paste those values into `src/js/firebase-config.js`, replacing the placeholders.
5. Before deploying, go to **Authentication → Settings → Authorized domains** and add whatever domain you deploy to (e.g. your GitHub Pages or Netlify domain). Sign-in will fail on a domain that isn't listed there, even if it works on `localhost`.

Firebase's web config values (`apiKey`, `authDomain`, etc.) are safe to commit — they aren't secrets. Access is controlled by the Sign-in method settings and Firebase Security Rules, not by hiding this config.

### Manual QA checklist (after adding your config)

- [ ] Visiting `index.html` directly while signed out redirects to `login.html`
- [ ] Registering a new account on `register.html` signs you in and lands on the planner
- [ ] Registering with a duplicate email / mismatched passwords / a short password shows an inline error and does not proceed
- [ ] Logging out of the planner returns you to `login.html`
- [ ] Logging in with the account you registered lands on the planner
- [ ] Logging in with the wrong password shows an inline error and does not proceed
- [ ] Reloading the planner while signed in keeps you signed in (no redirect to login)

## Cloud sync (Firestore)

Tasks are stored per-account in [Firestore](https://firebase.google.com/docs/firestore), Firebase's database — same project as auth, so there's nothing new to sign up for:

1. In the [Firebase Console](https://console.firebase.google.com/), open your project and go to **Build → Firestore Database → Create database**. Any region is fine; production mode is fine since the app ships its own rules.
2. Go to the **Rules** tab and replace the default rules with the contents of [`firestore.rules`](firestore.rules) in this repo, then **Publish**. This scopes every read/write to the signed-in user's own data.
3. That's it — no config values to copy; Firestore uses the same Firebase project config already in `src/js/firebase-config.js`.

### Manual QA checklist (after enabling Firestore + publishing the rules)

- [ ] A browser with tasks already in `localStorage` from before this feature sees them appear automatically the first time it logs in
- [ ] Logging out and back in on that same browser does not duplicate the migrated tasks
- [ ] Adding a task appears in the list without a manual reload
- [ ] Opening the same account in a second tab (or another browser) shows a task added in the first tab appear live, without reloading
- [ ] Completing/deleting a task in one tab is reflected in the other tab
- [ ] Logging out and back in (or opening on a different device) shows the same tasks
- [ ] Temporarily breaking the connection (e.g. dev tools "offline" mode) and trying to add a task shows a visible error rather than failing silently

## Development

This project uses the [HelpIRL Claude Template](https://github.com/HelpIRL/ClaudeTemplateV1)
for AI-assisted development. See `ClaudeTemplate.md` for details.

### Commands

- `/brain` — Scaffold a new feature with intent breakdown
- `/commit` — Smart commit with conventional format
- `/review` — Code review
- `/status` — Project status overview

## License

MIT — see [LICENSE](LICENSE).
