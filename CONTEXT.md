<!-- Built with ClaudeTemplate - see ClaudeTemplate.md -->
<!-- WARNING: Do not remove. Enables template features (/brain, /commit, etc.) -->

# Project Context

## Project Structure

- **Source code**: `src/` (`index.html`, `login.html`, `register.html`, `css/`, `js/`)
- **Tests**: none yet
- **Config files**: `src/js/firebase-config.js` (Firebase project config — not secret, but user-specific: see README "Setting up auth"), `firestore.rules` (Firestore security rules, pasted manually into the Firebase console)
- **Generated artifacts**: none — served as static files

## Language & Tooling

- **Language**: HTML, CSS, JavaScript (vanilla, no framework)
- **Framework**: none
- **Build**: none yet — static files served as-is
- **Test**: none yet
- **Package manager**: none

## Build & Test Entry Points

These are the approved commands. Do not invent alternatives.

- Build: none yet
- Test: none yet
- Lint: none yet

## Intent Management

Intents are stored under `Intents/{FeatureName}/` with numbered intent files.
See `/brain` command for the BRAIN workflow.

## Constraints

- No server process to write or host — Firebase Auth (accounts) and Firestore (per-account task storage) are used via CDN client SDKs, so there's still no build step and no server code in this repo.
- Must be deployable as a static site (e.g. GitHub Pages, Netlify). Deploying to a new domain requires adding that domain to Firebase's Authorized Domains (see README) and publishing `firestore.rules` in the Firebase console — both one-time manual steps in the Firebase project, not in this repo's build.
