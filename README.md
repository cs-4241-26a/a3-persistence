# Task Deadline Tracker

Render: **https://a3-avikshit-pal.onrender.com**

A two-tier task-tracking app, upgraded from Assignment 2 to use Express, MongoDB (via Mongoose), and Bootstrap. Users log in (or automatically get an account created), then see, add, edit, and delete their own tasks. The server calculates each task's deadline from its priority and creation date.

- **Goal:** let a user keep a private list of tasks, where the server automatically works out a deadline based on how urgent each task is.
- **Challenges:** the biggest challenge was restructuring the A2 app so that persistence and per-user data ownership were enforced *server-side* — every task query is scoped to `req.session.userId`, and static file serving had to be reorganized (HTML pages moved out of the public/static folder into a `views/` folder) so that `/app.html` couldn't be fetched directly, bypassing the login check. Getting Mongoose schemas, sessions, and hashed passwords working together cleanly took some iteration.
- **Authentication strategy:** simple username/password with sessions (`express-session` + `connect-mongo`), rather than OAuth. I chose this because it's self-contained (no third-party app registration needed), and per the assignment spec, logging in with an unrecognized username automatically creates an account — the user is alerted via a JS `alert()` that this happened.
- **CSS framework:** Bootstrap 5 (via CDN), because it gives solid default form, table, and card styling out of the box. I only added a small custom stylesheet (`public/css/main.css`) on top of it for: brand color (dark green header/buttons matching my A2 look), priority badge colors, a visible focus outline, and the skip-link styling — I did not override Bootstrap's core layout or component styles.

## Technical Achievements

**Tech Achievement 1 (5 points): Express middleware packages.** I installed and used the following third-party middleware (all via `npm`, none of them built into Express):

1. **`morgan`** — logs every incoming HTTP request (method, URL, status, response time) to the console, which was invaluable for debugging routes during development.
2. **`helmet`** — automatically sets a collection of security-related HTTP response headers (like Content-Security-Policy and X-Frame-Options) to protect against common web vulnerabilities.
3. **`compression`** — gzip-compresses response bodies before they're sent to the browser, reducing page load time.
4. **`express-rate-limit`** — limits how many login attempts a single IP can make in a 10-minute window, to slow down brute-force password guessing on `/api/login`.
5. **`connect-mongo`** — plugs into `express-session` to store session data in MongoDB instead of memory, so logged-in sessions survive a server restart on Render.

## Design/Evaluation Achievements

**Design Achievement 1 (10 points): W3C accessibility tips.** I followed twelve tips from the W3C Web Accessibility Initiative's tips for writing, designing, and developing:

1. **Use headings to convey structure** — every page has a single `<h1>` in the header and `<h2>`s for each major section (Log In, Add a Task, Your Tasks), instead of styling regular text to just *look* like a heading.
2. **Provide a "skip to content" link** — both pages have a visually-hidden-until-focused skip link at the very top of the `<body>` that jumps a keyboard user straight to the form/main content, past the repeated header.
3. **Associate every form label with its input** — every `<input>`/`<textarea>` uses a `<label for="...">` pointing at a matching `id`, including the radio-button group, which is additionally wrapped in a `<fieldset>`/`<legend>`.
4. **Don't rely on color alone to convey meaning** — priority isn't shown by color alone; the priority badge also contains the text "high"/"medium"/"low".
5. **Ensure sufficient color contrast** — I specifically picked darker shades for the priority badges and header (e.g. `#8f342b` for high-priority) so white text on them meets WCAG AA's 4.5:1 contrast ratio, rather than using Bootstrap's brighter default reds/yellows.
6. **Keep visible focus indicators** — I added an explicit `:focus-visible` outline rule in `main.css` on every interactive element, since browsers' default outlines are easy to accidentally suppress and keyboard users rely on them to track where they are.
7. **Write descriptive link/button text and labels** — the Edit and Delete buttons each get an `aria-label` that includes the actual task name (e.g. "Delete task: Finish assignment 3"), so a screen reader user doesn't hear a list of ambiguous "Delete, Delete, Delete" buttons.
8. **Use `aria-live` regions for dynamic content** — the login and add-task error/success messages are inside a `div` with `aria-live="polite"`, so screen reader users are told about a validation error without needing to hunt for it.
9. **Don't disable pinch-zoom or text resizing** — the viewport meta tag intentionally omits `maximum-scale=1` / `user-scalable=no`, so users who need to zoom in on mobile devices can.
10. **Set the page language** — both HTML documents declare `lang="en"` on the `<html>` element so screen readers use the correct pronunciation rules.
11. **Make all interactive elements keyboard-operable** — every action (submit, cancel edit, edit row, delete row, log out) is a real `<button>` element with an `onclick` handler, not a `<div>` or `<span>` with a click listener, so it's reachable and operable via Tab and Enter/Space without extra work.
12. **Give form fields helper text tied to them with `aria-describedby`** — the username and password fields each have a `<div class="form-text">` (e.g. "At least 4 characters") linked via `aria-describedby`, so assistive tech reads the requirement along with the field, not just on hover.

## Notes for graders

- MongoDB connection string and session secret are read from environment variables (`MONGODB_URI`, `SESSION_SECRET`) — see `.env.example`. These are configured directly in Render's Environment tab for the deployed version, and in a local `.env` file (not committed) for local development.
- Logging in with a username that doesn't exist yet automatically creates an account, and the page shows an alert telling the user this happened, per the assignment instructions.

### LLM Usage
- Used to choose npm packages as well as update and implement 12 W3C tips
