# Bookmark Manager

https://a3-christian-dellanno.onrender.com

A two-tier web application for saving and organizing personal bookmarks. Users log in (or
automatically get an account created) and can add, edit, and delete bookmarks tied to their
account. All data persists in MongoDB between sessions.

- **Goal**: Give users a simple, private place to save links with a title, category, and notes,
  and to mark favorites.
- **Challenges**: Getting session-based auth to play nicely with a MongoDB-backed session store
  (`connect-mongo`) so logins survive a server restart; scoping every database query to
  `req.session.userId` so users can only ever see their own bookmarks; keeping the edit/add form
  in sync with the list without a front-end framework.
- **Authentication strategy**: Simple username/password auth with `bcryptjs` password hashing and
  `express-session`. Per the assignment spec, logging in with a username that doesn't exist yet
  automatically creates the account (and the UI alerts the user that a new account was made). This
  was chosen for simplicity and because OAuth was explicitly out of scope for this submission.
- **CSS framework**: [Bootstrap 5](https://getbootstrap.com/) via CDN, chosen for its wide
  component coverage (cards, forms, badges, navbar) and because it needed almost no custom
  overrides to look clean — a few small tweaks live in `public/css/style.css`.

## Technical Achievements

- **Middleware list** (up to 5 pts): Express middleware packages used beyond the express-provided
  `express.json` / `express.static`:
  - `express-session` — manages login sessions via signed cookies.
  - `connect-mongo` — stores session data in MongoDB so logins persist across server restarts.
  - `bcryptjs` — hashes and verifies user passwords.
  - `helmet` — sets a range of security-related HTTP headers (CSP, etc.).
  - `morgan` — logs incoming HTTP requests to the console for debugging.


### Design/Evaluation Achievements

*(None claimed for this submission — baseline requirements only, beyond the middleware list
above.)*
