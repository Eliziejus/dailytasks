# Daily Planner

A simple website with a calendar and a daily task list.

## Getting Started

No build step required. Clone the repo and open `src/index.html` in a browser,
or serve `src/` with any static file server.

## Usage

- Register or log in with an email/password account.
- View the calendar and pick a day.
- Add, complete, and delete tasks for that day.
- Tasks are saved in your browser's `localStorage`, scoped to the browser (not synced across devices) — logging in only controls who can open the app.

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
- [ ] Tasks you add still persist across a reload, exactly as before auth was added

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
