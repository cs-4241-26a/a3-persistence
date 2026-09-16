# Shubham's Workout Tracker

**Live Application:** https://a3-shubham-kumar.onrender.com 

Workout Tracker is a full-stack strength-training app that lets users securely log in, add, edit, delete, and review their own persistent workout data. The goal was to extend the previous in memory tracker into a multi-user application using Express, MongoDB, and authentication. The biggest challenges were adding persistent database storage, user specific data access, and GitHub OAuth authentication. I used cookie based sessions with GitHub OAuth, while also retaining username/password login with bcrypt hashing. Bootstrap 5 provides the main styling and responsive layout, with only a small amount of custom CSS for minor adjustments such as card borders, table sizing, and textarea behavior.

## Technical Achievements

- **Tech Achievement 1 — GitHub OAuth Authentication:**  
  I implemented GitHub OAuth authentication. Users can log in through GitHub, and the server validates the OAuth state, exchanges the returned authorization code for an access token, retrieves the user's GitHub profile, stores the GitHub identity in the session, and associates workout data with that GitHub account. OAuth credentials are stored in environment variables rather than committed to the repository.

- **Tech Achievement 2 — 100% Lighthouse Scores:**  
  I achieved 100% in all four required Lighthouse categories on both the login page and the app page.

## Design/Evaluation Achievements

- **Design Achievement 1 — W3C Web Accessibility Initiative:**  
  I followed at least twelve W3C accessibility recommendations throughout my app:

  1. **Informative page titles** — The login and main application pages use distinct, descriptive titles.
  2. **Meaningful headings** — `<h1>` and `<h2>` elements organize the page into clear sections.
  3. **Meaningful link text** — Links use descriptive text such as "Continue with GitHub" and "Log Out".
  4. **Clear and concise content** — Labels and instructions use short, simple wording.
  5. **Sufficient color contrast** — Bootstrap colors and components provide readable foreground/background contrast.
  6. **Color is not the only indicator** — Actions such as Edit, Delete, Log In, and Log Out are identified with text in addition to color.
  7. **Clearly identifiable interactive elements** — Bootstrap styling makes links, buttons, inputs, radio buttons, and selects easy to recognize.
  8. **Labels associated with form controls** — Form controls use matching `<label for="">` and id attributes, with `<fieldset>` and `<legend>` used for grouped radio buttons.
  9. **Headings and spacing group related content** — Bootstrap cards and spacing utilities separate the entry form from workout results.
  10. **Responsive design** — Bootstrap's grid system and responsive table layout adapt to different viewport sizes.
  11. **Page language identified** — Pages use `<html lang="en">`.
  12. **Semantic HTML structure** — The site uses elements such as `<main>`, `<header>`, `<section>`, `<form>`, `<fieldset>`, `<table>`, `<thead>`, and `<tbody>`.
