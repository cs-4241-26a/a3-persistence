# CS4241 Assignment 3 - Better People Database

## Author
Raghavan Rajkumar

## Project Description
A full-stack People Database using Express, MongoDB, GitHub OAuth, and Bootstrap. Users can log in with GitHub and add, update, and delete their own people records.

### GitHub OAuth
Implemented GitHub authentication using Passport and `passport-github2`. Each MongoDB record is associated with the logged-in user's GitHub ID so users only see their own data.

### Express Middleware
- **express-session** - Maintains user login sessions.
- **passport** - Handles user authentication.
- **helmet** - Adds security-related HTTP headers.
- **compression** - Compresses server responses.
- **morgan** - Logs HTTP requests.

### Bootstrap
Used Bootstrap for forms, buttons, cards, lists, spacing, and overall page layout.

### Accessibility
Implemented 12 W3C accessibility recommendations, including descriptive titles, heading structure, meaningful links, form instructions, sufficient contrast, text labels on buttons, identifiable controls, form labels, input validation, page language, semantic HTML, and keyboard accessibility.

Render: https://a3-raghavan-rajkumar.onrender.com/