Assignment 3 - Persistence: Two-tier Web Application with Database, Express server, and CSS template
===

## Car Fleet Tracker

[Link to the project running on Render](https://a3-brandoncontardi-8.onrender.com/)

Car Fleet Tracker is a two-tier web app for managing a personal fleet of cars. Users log in (or create an
account on the spot) and see only the cars associated with their own account. For each car the server derives
an efficiency rating (Excellent / Good / Poor, from MPG) and an age category (Classic / Modern, from year) so
those fields never have to be entered or stored redundantly.

- **Goal**: extend the A2 in-memory version into a real two-tier app — an Express server backed by MongoDB for
  persistent storage, with per-user accounts so each user's fleet data is private.
- **Challenges**: the biggest lift was restructuring the A2 code (a raw `http` server holding everything in an
  in-memory array) into an Express app with async Mongoose queries scoped to the logged-in user on every route,
  while making sure someone can't read or edit another user's cars by guessing an id. Wiring up `express-session`
  with a MongoDB-backed session store (`connect-mongo`) so sessions survive server restarts, and splitting the
  login page from the protected app page (served only through an authenticated route rather than as a static
  file), also took some iteration.
- **Authentication strategy**: simple username/password login, chosen because it's the most direct way to
  satisfy the assignment without needing an external OAuth provider. Passwords are hashed with `bcryptjs` before
  being stored. If a submitted username doesn't exist yet, an account is created automatically and the user is
  shown a notice ("Welcome! A new account was created for...") so they know what happened.
- **CSS framework**: [Bulma](https://bulma.io/), loaded via CDN. Bulma provides essentially all of the styling
  in this app — the hero login layout, the box/field/control form styling, the navbar, and the table. The only
  custom CSS (`public/css/main.css`) is a handful of small tweaks: the Inter font, and colored text for the
  Excellent/Good/Poor efficiency labels, since Bulma has no opinion on that domain-specific detail.

## Technical Achievements
- **Tech Achievement**: Express middleware packages used (installed separately via npm, beyond what ships with Express):
  - `express-session` — manages signed session cookies and per-request `req.session` objects for login state.
  - `connect-mongo` — persists sessions in MongoDB so logins survive server restarts, instead of an in-memory store.
  - `helmet` — sets a range of security-related HTTP response headers (CSP, etc.) to reduce common web vulnerabilities.
  - `morgan` — logs each incoming HTTP request to the console for debugging.

## AI Usage
AI was used to create this readme based off of the code. I checked to make sure the created readme was accurate to the code before submission.
