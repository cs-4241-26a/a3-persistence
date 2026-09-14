# Get It Done List

Get It Done List
https://a3-jacobcamoin.onrender.com

Get It Done List is a task manager for an individual that helps users organize themselves with their tasks. A user logs-in, enters a task, chooses a priority, and selects a start date. A deadline is calculated: one day for high-priority tasks, three days for medium-priority tasks, and seven days for low-priority tasks. Users can add, edit, and delete todos - data remains available between server sessions through MongoDB Atlas.

## Design and implementation
Users can create a local account with a username and password, or authenticate with GitHub OAuth. Local passwords are hashed with bcrypt before storage; Express sessions are stored in MongoDB. (this way seemed easy so I went with it)

The most challenging parts were connecting authentication to user-specific database records - I had never fully done auth by myself so it took me some time, and I had to do a lot of research to get it done.

I used Pico CSS to enhance UI of the todo app - Pico was one of the top frameworks that popped up when I looked it up, (it looked fairly straight forward) I tested it and  it worked well.


## Core functionality

- Create a local account / sign in with GitHub
- Maintain authenticated sessions in MongoDB
- Add todos with a description, priority, and start date
- Calculate deadlines using priority
- Edit / delete todos
- Accessible for desktop and mobile

## Technical achievements


- **Tech Acheivement 1**: I used OAuth authentication via the Github strategy
- **express-session:** Creates server-managed login sessions - sends cookie to the browser.


## Design/Evaluation Achievements
**Design Acheivement 1**: I followed the following tips from the W3C Accessibility Initiative:

1. **Skip repeated content:** A keyboard-visible “Skip to main content” link allows users to bypass account navigation.
2. **Use semantic regions:** The interface uses header, nav, main, section, and footer landmarks so assistive-technology users can navigate by region
3. **Use a logical heading structure:** Each application view has a primary heading, and its sections use descriptive headings in hierarchical order
4. **Associate labels with controls:** Every input, textarea, and select has an explicit label connected to the corresponding control.
5. **Provide useful instructions:** Text before the forms explains automatic account creation, password case sensitivity, required todo fields, and automatic deadlines.
6. **Announce dynamic feedback:** Login errors and todo operation results use role="status" and aria-live="polite"
7. **Describe tabular information:** The desktop todo table contains an assistive-technology caption and uses scoped column headers.
8. **Give controls descriptive names:** JavaScript includes the task description in the accessible name 
9. **Keep keyboard focus visible:** Interactive elements receive a high-contrast, three-pixel focus indicator
10. **Maintain color contrast:** Dark blue text - contrasting it with white background
11. **Support zoom and small displays:** Fluid text, wrapping layouts, safe-area padding, stacked mobile task cards, and long-word wrapping prevent content loss at narrow widths.
12. **Respect motion preferences:** A prefers-reduced-motion media query minimizes animations and transitions when the operating system requests reduced motion.