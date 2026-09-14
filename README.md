## Page Turner

Live app: https://a3-chris-cardaropoli.onrender.com/

Page Turner is a personal reading tracker built for Assignment 3. The goal of the application is simple: let a user sign up, sign in, and keep a list of books tied to their own account. Each user sees only their own items, and the app stores everything in MongoDB so the records persist between browser sessions and server restarts.

The biggest challenge was combining Express, MongoDB, and per-user account handling into a single app without letting one user access another user’s data. I solved this by storing a `username` alongside each record and validating that the active account matches the item before any update or delete is allowed. The front end uses JavaScript fetch calls so users can add, edit, and delete books without a page refresh, while the app still feels responsive and lightweight.

For authentication, I chose a custom username/password flow instead of OAuth because it was the most direct and dependable implementation for this assignment while still satisfying the requirement for multiple user accounts. I used Bootstrap from a CDN as the primary CSS framework because it gives the site a polished and consistent layout quickly, and I added a small amount of custom CSS for spacing, contrast, and readability adjustments.

## Technical Achievements
- **User account system with isolation**: Users can sign up and sign in, and the app prevents switching accounts without logging out. Each reading item is scoped to the signed-in user.
- **MongoDB persistence**: The application stores both account data and user reading data in MongoDB rather than keeping everything in memory, which keeps the project aligned with the assignment’s persistence requirement.
- **Server-side validation and secure CRUD flow**: The server checks usernames, passwords, and required fields before processing requests. It also verifies that an item belongs to the current account before updating or deleting it.
- **Auth0 authentication integration**: The app includes a real Passport Auth0 login flow, including the login route, callback handling, logout route, and session management. This gives the application an OAuth-based login option in addition to the local sign-up/sign-in flow.
- **Lighthouse Tests**: So something strange happens with this and that when I test it with my normal Chrome page it gives me a ! on preformance but then when I go to a guest page it gives me an 100 which I couldn't really understand but it worked.
- **Middleware stack**: The project uses five installed middleware packages: `helmet` adds security headers, `morgan` logs HTTP requests, `express-session` manages login sessions, `passport` handles authentication strategies, and `passport-auth0` connects the app to the Auth0 OAuth provider.
- **Bonus polish: session-aware frontend**: The browser tracks the current signed-in user with local storage, visually updates the active user badge, and clears stale auth state when a user logs out.

## Design / UX Achievements
- **Bootstrap-based interface**: I used Bootstrap for layout, forms, cards, and buttons so the app has a clean and professional structure without writing a full custom design system.
- **Improved accessibility**: The app includes labels for form controls, visible status messages, clear user feedback, and a persistent sign-in badge so the user always knows which account is active.
- **Responsive layout**: The form and result table are designed to adapt cleanly to smaller screens, keeping the interface usable beyond a desktop-only layout.
- **Visual consistency**: I kept a consistent color palette, spacing model, and UI treatment across the account form, book form, and results table to create a more cohesive experience.
- **W3C accessibility implementation**: I followed a set of WAI accessibility practices and implemented them directly in the app, including clear labels, status messaging, keyboard-friendly controls, proper focus behavior, and interface feedback. The following twelve tips were used and applied to the project:
  1. Use clear, descriptive page headings to organize information with a logical reading flow.
  2. Provide visible labels for every form input so users understand what data is required.
  3. Keep the form structure simple and consistent so users can complete tasks without guessing.
  4. Ensure all interactive elements are reachable and usable with a keyboard.
  5. Provide visible focus styling and maintain clear button states for actions such as add, edit, and delete.
  6. Use high-contrast text and controls so information remains readable for users with low vision.
  7. Avoid relying on color alone to communicate status or account state; the app uses text messages and badges.
  8. Keep button labels action-oriented and specific, such as “Add book,” “Update book,” and “Log out.”
  9. Ensure status updates are announced with role and live-region messaging for sign-in and item actions.
  10. Use semantic HTML structure and clear section headings so screen readers can navigate the page logically.
  11. Keep the layout responsive and readable on smaller screens so controls do not become cramped or unusable.
  12. Make error and success messages direct and understandable so users know what happened and what to do next.

## Summary
This project satisfies the core assignment requirements for Express, MongoDB persistence, per-user authentication, and CRUD operations with a CSS framework. The result is a fully functional reading tracker with a user-specific data model, a polished UI, and a documented accessibility-focused implementation suitable for submission.
