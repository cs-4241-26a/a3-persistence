I messed up the due date with this assignment and talked with the professor. He said it was ok for me to turn it in late.

# Movie Watchlist

This project is my third assignment for CS4241. It expands my previous Movie Watchlist application into a full-stack web application with user authentication and persistent database storage.

Live Website: https://a3-jennifer-yuan.onrender.com/

The goal of the application is to allow users to create their own personal movie watchlist. Users can create an account, log in, add movies, edit movies, delete movies, and rate movies from 1–10. The server automatically creates a recommendation based on the rating.

Each user's movie watchlist is connected to their account, so users only see the movies that they have added.

One of the main challenges I faced was connecting the application to MongoDB and changing my previous server-side data storage to persistent database storage. I also had to change the application so that each movie is associated with the user who created it.

For authentication, I used username and password authentication with `bcrypt` and `express-session`. Passwords are hashed using bcrypt before being stored in MongoDB. I chose this authentication strategy because it worked well with my existing Express server and allowed me to create a simple registration and login system.

For my CSS framework, I used Bootstrap 5. I used Bootstrap components and classes for forms, buttons, tables, cards, and responsive styling. I also kept my own custom CSS to change Bootstrap's default appearance and give the Movie Watchlist its own design. My custom CSS changes the colors, spacing, card appearance, recommendation labels, layout, and responsive behavior.

## Technical Achievements

- **Tech Achievement 1: MongoDB Persistent Storage**  
  I connected my application to MongoDB Atlas using the MongoDB Node.js driver. Movie and user information is stored in MongoDB instead of only being stored in server memory. This allows the data to remain available even when the server is restarted.

- **Tech Achievement 2: User Authentication**  
  I created a registration, login, and logout system using `bcrypt` and `express-session`. User passwords are hashed before being stored in the database, and passwords are not returned when displaying user information.

- **Tech Achievement 3: User-Specific Data**  
  Each movie is associated with the username of the user who created it. When a user logs in, the server only returns movies associated with that user's account. Users cannot view or modify another user's watchlist.

- **Tech Achievement 4: Full CRUD Functionality**  
  Logged-in users can create, read, update, and delete movies from their watchlist. When a movie is edited, the server also recalculates its recommendation based on the new rating.

- **Tech Achievement 5: Client and Server Communication**  
  I used `fetch()` to communicate between the browser and the Express server. Movie data and account actions can be updated without reloading the entire webpage.

- **Tech Achievement 6: Derived Recommendation Field**  
  The server automatically calculates a recommendation based on the user's movie rating:
  - Ratings 8–10 = Must Watch
  - Ratings 6–7 = Worth Watching
  - Ratings 1–5 = Skip

## Design/Evaluation Achievements

- **Design Achievement 1: Bootstrap CSS Framework**  
  I used Bootstrap 5 as the CSS framework for the application. I used Bootstrap classes including `form-control`, `form-select`, `btn`, `btn-primary`, `btn-secondary`, `table`, `table-hover`, `table-responsive`, and `align-middle`.

- **Design Achievement 2: Custom Bootstrap Styling**  
  I combined Bootstrap with my own external CSS stylesheet. I customized the background colors, cards, spacing, buttons, movie recommendation labels, forms, and overall page layout while still using Bootstrap components.

- **Design Achievement 3: Responsive Layout**  
  The application adjusts for smaller screens. The login/register sections and movie application change from horizontal layouts to vertical layouts on smaller devices, and the movie table can scroll horizontally when necessary.

- **Design Achievement 4: Visual Recommendation System**  
  I created different visual styles for the three recommendation categories. "Must Watch," "Worth Watching," and "Skip" each have their own background style so users can quickly understand the recommendation.

## W3C Accessibility Achievements

I followed twelve accessibility recommendations from the W3C Web
Accessibility Initiative (WAI) when designing and developing my
Movie Watchlist.

1. **Provide informative, unique page titles:** I gave the page the
   descriptive title "Movie Watchlist - Personal Movie Recommendations"
   so users and assistive technologies can identify the purpose of the page.

2. **Use headings to convey meaning and structure:** I organized the page
   using an H1 for the application title and H2/H3 headings for sections
   including Account, Create Account, Log In, Add a Movie, and My Watchlist.

3. **Provide clear instructions:** I added instructions to the movie form
   explaining that users should enter a movie title, select a genre, and
   provide a rating from 1 to 10.

4. **Associate labels with form controls** I explicitly associated text labels with the username, password, movie title, genre, and rating form controls using HTML label elements and matching for and id attributes. This allows screen readers to announce the purpose of each field and makes the forms easier to understand and navigate.

5. **Provide sufficient contrast:** I selected foreground and background
   colors that provide readable contrast and tested the page using
   Lighthouse's accessibility audit.

6. **Don't use color alone to convey information:** Movie recommendations
   use both visual colors and text labels: "Must Watch", "Worth Watching",
   and "Skip". Users do not need to distinguish the colors to understand
   the recommendation.

7. **Make interactive elements easy to identify:** I used Bootstrap button
   styling and descriptive button text for actions such as Register,
   Log In, Log Out, Add Movie, Edit, Delete, and Cancel Edit.

8. **Identify page language:** I added `lang="en"` to the HTML element
    so assistive technologies can determine that the page is written
    in English.

9. **Use markup to convey meaning and structure:** I used semantic HTML
    elements including header, main, section, form, table, thead, tbody,
    and footer rather than constructing the entire interface from generic
    div elements.

10. **Create designs for different viewport sizes:** I created a responsive
    layout using a CSS media query and Bootstrap responsive features. On
    smaller screens, the account and movie sections switch to vertical
    layouts and the movie table can scroll horizontally.

11. **Provide clear instructions and feedback for user input:** I used clearly labeled form fields for authentication and movie information and provided status/error messages when actions succeed or fail. This gives users clear feedback about what information is required and whether their action was successful.

12. **Make functionality keyboard accessible:** I used standard HTML form controls, links, and buttons for interactive features such as login, registration, adding movies, editing, deleting, canceling edits, and logging out. This allows users to navigate and operate the application using a keyboard without requiring a mouse.

## Express Middleware

I used the following five separately installed Express middleware packages:

1. **express-session** - Maintains user sessions so users can remain authenticated while using their personal movie watchlist.

2. **helmet** - Adds security-related HTTP headers to help protect the application from common web security issues.

3. **compression** - Compresses HTTP responses before they are sent to the browser to reduce the amount of data transferred.

4. **morgan** - Logs HTTP requests to the server console, which helps with monitoring and debugging requests.

5. **express-rate-limit** - Limits repeated requests to the registration and login endpoints to help protect the authentication system from excessive requests.



## AI Use

I used ChatGPT to help explain errors, debug my Node.js and MongoDB implementation, troubleshoot authentication, and help with HTML, CSS, JavaScript, Express, and Bootstrap implementation.