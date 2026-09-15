## Poetry Entry System

Render link: https://a3-mohammed-musawwir.onrender.com

You can add Arabic poems with the author, title, maqam(s) [which is a basically the musical style], form, birth year, and notes. The server figures out the era (Classical or Modern), the mood based on the maqams, and if the poem has more than one maqam. You can open the page without logging in but you need to log in with GitHub to actually see and save your poems. 

## Technical Achievements
- **Tech Achievement 1 (10 points):** 

 GitHub OAuth with passport and passport-github2.  Also there are 3 default poems that every account has.

- **Tech Achievement 2 (5 points):** 
Middleware packages I used:
  - **cookie-session** - keeps the logged in username in a signed cookie
  - **passport** - handles the GitHub login
  - **helmet** - adds security headers to responses
  - **compression** - gzips responses so stuff loads faster
  - **morgan** - logs every request in the console

### Design/Evaluation Achievements
- **Design Achievement 1 (10 points):** W3C accessibility tips I followed:
  1. **Informative page title** - changed it to "Your Poems - Poetry Entry System"
  2. **Headings** - one h1 and h2s for "Add or Edit a Poem" and "Your Poems"
  3. **Meaningful link text** - login button says "Log in with GitHub"
  4. **Clear instructions** - required fields say (required) and birth year has a hint
  5. **Contrast** - Delete button is black text on red since white on red was too low
  6. **Not just color** - Delete button still says Delete, required fields use words not colors
  7. **Labels** - every input has a label, checkboxes and radios are in fieldsets with legends
  8. **Feedback** - shows Poem added/updated/deleted and tells you if you forgot a maqam or aren't logged in
  9. **Screen sizes** - added viewport meta tag and used Pico's container
  10. **Markup** - used main, scope="col" on table headers, role="status" on the message, and aria-labels on Edit/Delete
  11. **Avoiding mistakes** - required fields, birth year limited to 1-2026, delete asks to confirm
  12. **Keyboard** - everything is a real button or link, and Edit moves focus to the Author box


  AI NOTICE: I used AI to help me generate this ReadMe because when you are working linearly and then looping back and making a bunch of edits it is sometimes hard to keep track of everything. I also used to help me explain how all these different packages i want to use go together, and file management. And also to help phrase the "vibes" conveyed by each maqam.

