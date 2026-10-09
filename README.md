## Weekly HW Calculator

https://a3-persistence-e2s8.onrender.com

Weekly HW Calculator is a two-tier web app that extends my A2 to-do list into a persistent, multi-user application. Each user logs in with a username and password (an account is created automatically the first time you log in with a new username, and you're notified when that happens), and can add, edit, and delete their own tasks. Every task is tagged with a priority (high, medium, or low), and the server automatically calculates a deadline for it based on that priority and when it was created — high-priority tasks are due in 1 day, medium in 3 days, and low in 7 days. All data is stored per-user in MongoDB, so tasks persist across server restarts and are only ever visible to the account that created them.

**Challenges:** The biggest challenges in this assignment were all around configuration and the parts of the stack that fail silently rather than with an obvious error. Getting environment variables to actually load correctly from a `.env` file took some effort. Windows' Notepad defaults to a text encoding that Node's `dotenv` package can't parse. THis caused my Mongo connection string to  silently readi as `undefined` with no clear indication why. I also ran into a subtle Mongoose issue, where a `pre('save')` middleware function that mixed `async` with an explicit `next()` callback threw a `next is not a function` error. the fix was picking one style (async/await) instead of mixing calling conventions. 

**Authentication:** I used a simple session-based authentication strategy with `express-session` and password hashing via `bcryptjs`, rather than OAuth. I chose this because it was the most straightforward to implement correctly and reason about for a first pass at server-side auth, and it satisfies the assignment's baseline requirement that new accounts can be created automatically on first login (with a clear alert to the user when that happens).

**CSS framework:** I used Bootstrap 5, loaded via CDN, for essentially all of the app's visual styling; cards, the navbar, form controls, table layout, and priority badges are all built from Bootstrap's existing components and utility classes rather than custom CSS. I chose Bootstrap because of its broad component coverage (forms, tables, alerts, badges) that mapped directly onto what this app needed. I also have found that it's forgiving to build with, without needing strong graphic design skills of my own.

**CSS modifications:** I did not override or add custom CSS on top of Bootstrap's default styling — per the assignment's own guidance, I relied on Bootstrap's built-in design decisions rather than second-guessing them with my own stylesheet.

## A4 COMPLETED --> IMPLEMENTED WITH REACT