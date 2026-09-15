## Max's Auto Dealership

https://a3-maxgambino.onrender.com

A per-user car inventory manager built for CS4241 A3. Users sign in (or auto-register) and can add, edit, and delete cars from their personal inventory. Data is stored persistently in MongoDB; each user only sees their own cars.

- **Goal:** Let dealership staff track their vehicle inventory from any device, with data that persists between sessions.
- **Challenges:** Wiring up per-user data isolation in MongoDB (filtering every query by `username`) and keeping sessions alive across Render restarts via `connect-mongo`.
- **Authentication:** Simple username/password with `bcryptjs` hashing. New accounts are created automatically on first login. Users are told this on the login page. Chosen because it satisfies the requirement with minimal complexity.
- **CSS Framework:** Bootstrap 5 (CDN). Provides the navbar, card layouts, table styling, form controls, and badges out of the box. The only custom CSS is the Inter font family and a single `vertical-align` rule for table cells.

## Technical Achievements

- **Tech Achievement 1 — Five Express middleware packages:**
  1. **`express-session`** — manages server-side HTTP sessions, keeping users logged in between requests.
  2. **`connect-mongo`** — stores session data in MongoDB so sessions survive server restarts.
  3. **`helmet`** — sets secure HTTP response headers (HSTS, X-Frame-Options, etc.) to harden the app against common web attacks.
  4. **`morgan`** — logs every HTTP request's method, URL, status code, and response time to the console.
  5. **`compression`** — gzip-compresses all HTTP responses, reducing transfer size for HTML, JSON, and static assets.

- **Tech Achievement 2 — 100 On All Lighthouse Tests**
  1. **Performance** — 100
  2. **Accessibility** — 100
  3. **Best Practices** — 100
  4. **SEO** — 100

## Design/Evaluation Achievements

- **Design Achievement 1 — W3C Accessibility (12 tips)**

  1. **Provide informative, unique page titles** *(Writing)* — Each page has a distinct, descriptive `<title>`: "Sign In — Max's Auto Dealership" on the login page and "Max's Auto Dealership" on the inventory page, so screen readers and browser tabs clearly identify each page.

  2. **Provide clear instructions** *(Writing)* — The login page includes an info alert explicitly telling users that a new account will be created automatically if their username doesn't exist, so they know what to expect without guessing.

  3. **Don't use color alone to convey information** *(Designing)* — Value rating badges display a text label ("Great Deal", "Good Value", "Fair Price", "Premium") alongside their background color, so users who cannot perceive color still receive the same information.

  4. **Provide sufficient contrast between foreground and background** *(Designing)* — The "Fair Price" badge uses Bootstrap's `bg-warning` (yellow) with an explicit `text-dark` class to ensure the dark text meets WCAG contrast requirements against the yellow background.

  5. **Ensure form elements include clearly associated labels** *(Designing)* — Every `<input>`, `<textarea>`, and radio button has a `<label>` element with a matching `for`/`id` pair, so assistive technologies announce the correct label when a control receives focus.

  6. **Use headings and spacing to group related content** *(Designing)* — The transmission radio buttons are wrapped in a `<fieldset>` with a `<legend>` ("Transmission"), grouping the related controls semantically rather than just visually.

  7. **Identify page language** *(Development)* — Both HTML documents declare `<html lang="en">`, allowing screen readers to select the correct pronunciation rules and voice.

  8. **Use mark-up to convey meaning and structure** *(Development)* — Semantic elements are used throughout: `<nav>`, `<main>`, `<footer>`, `<fieldset>`, `<legend>`, and `<table>` with `scope="col"` on every header cell, so document structure is conveyed through HTML rather than just CSS.

  9. **Help users avoid and correct mistakes** *(Development)* — Required fields carry both `required` and `aria-required="true"`. On the login form, both inputs include `aria-describedby="error-msg"` so screen readers re-read the error region after a failed submission.

  10. **Provide easily identifiable feedback** *(Development)* — The login error `<div>` has `aria-live="assertive"` so screen readers announce error messages immediately when they appear, without the user having to navigate to them.

  11. **Ensure interactive elements are keyboard accessible** *(Development)* — A visually hidden "Skip to main content" link (Bootstrap `visually-hidden-focusable`) is the first focusable element on both pages, letting keyboard-only users bypass the navbar and jump directly to the page content.

  12. **Reflect the reading order in the code order** *(Development)* — The inventory empty-state paragraph (`<p id="empty-msg">`) is placed directly after the table in the DOM and carries `role="status"` with `aria-live="polite"`, ensuring that when it becomes visible after a delete it is announced in logical reading order without interrupting the user.

## Acknowledgements

- [Claude](https://claude.ai) (Anthropic) — assisted with debugging the MongoDB Atlas/Render SSL connection error and helped refine and style this README.
