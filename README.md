# Bookmark Manager

[Link to your project running on Render — fill in after deploying]

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

*(OAuth achievement intentionally not attempted for this submission.)*

### Design/Evaluation Achievements

*(None claimed for this submission — baseline requirements only, beyond the middleware list
above.)*

## Setup

1. `npm install`
2. Copy `.env.example` to `.env` and fill in:
   - `MONGODB_URI` — a MongoDB Atlas connection string
   - `SESSION_SECRET` — any long random string
3. `npm start` (or `npm run dev` with nodemon installed)
4. Visit `http://localhost:3000`

## Data model

- **User**: `username`, `passwordHash`
- **Item (bookmark)**: `userId`, `title`, `url`, `category` (work / personal / learning / other),
  `notes`, `favorite`, `createdAt`

## Deploying to Render

1. Push this repo to GitHub under the name `a3-yourfirstname-yourlastname`.
2. Create a new Web Service on Render pointing at the repo.
3. Set the build command to `npm install` and the start command to `npm start`.
4. Add `MONGODB_URI` and `SESSION_SECRET` as environment variables in Render's dashboard.
5. Once deployed, update the `homepage` field in `package.json` and the link at the top of this
   README with the live Render URL.
