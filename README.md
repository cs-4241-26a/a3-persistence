Assignment 3 - Persistence: Two-tier Web Application with Database, Express server, and CSS template
===

Due: September 15th, by 1:59 PM.

## Password Manager

https://a3-teagantran.onrender.com

The goal of this application is to provide a simple and easy way to manage your login credentials to various websites and apps. 

During the development of this application, I faced a few challenges such as the mongoDB integration and the authentication page. I was able to make a connection to mongoDB early in the assigment, however I struggled with being able to connect it to a cluster and edit the data as needed based on the inputs provided by the website. I eventually solved this issue by researching what functions are used for mongoDB, and combining them with my existing functions. The challenge with authentication was finding a balance between an easy method to implement, but secure enough to use. 

Since I didn't have much knowledge in authentication methods, I decided to authenticate my page using a simple username and password system that a number generator assigns an ID to, stored on the database. A user must input a matching username and password as one of the saved IDs to be able to continue past the login screen, or create a new account. It was the easiest to implement while showcasing the use of mongoDB functions beyond the website's main functionality.

I used the Pure.css framework from https://pure-css.github.io/ as my main framework. I chose it due to its lightweight design and simple design, where I'd be able to include CSS styling of my own on top of the framework without having to make any major changes to my code.

Modifications made to Pure.css:
- Body: Added dark gradient background and white text for contrast, Times New Roman font, and centered text
- form: changed layout to a single-column CSS grid, made input full width and rounded the corners, and placed the buttons inn the first grid column
- #website, #password, and #username: changed border color to blueviolet
- buttons: added more contrast between text and background for lighthouse requirements

## Technical Achievements
**Tech Achievement 1**: I achieved a 100% score in all four lighthouse tests. I modified the Pure.css framework to adhere to the accessibility requirements as the base designs only achieved 90% on lighthouse, added headers and landmarks for semantics, and a meta description to ensure SEO score became 100.

### Design/Evaluation Achievements
**Design Achievement 1**: I followed the following tips from the W3C Web Accessibility Initiative: 
- Provide sufficient contrast between foreground and background: Uses white text against dark background, and increased contrast on buttons
- Use headings and spacing to group related content: Authentication and password functions are grouped into separate section elements, using CSS to add spacing between form controls and padding around the container
- Use headings to convey meaning and structure: h1 is used for "Password Manager" and h2 is used for "Log in"
- Provide clear instructions: The text “Save and manage your website credentials” explains the purpose of the application, while the input placeholders and button text explain the available actions.
- Keep content clear and concise: Short labels are used for actions such as logging in, creating accounts, submitting, editing, and deleting.
- Associate a label with every form control: Each input has an aria-label for accessibility users
- Identify page language and language changes: index.html has lang='en' declared, and no other languages are used on the page
- Help users avoid and correct mistakes: Inputs are required, need to be the appropriate type, and allows for autocomplete. The server also validates information, and requires a length of 8 characters for the password. If any errors occur, a corresponding message pops up.
- Reflect the reading order in the code order: The html order follows the user workflow: page title, login form, application content, credential form, and then dynamically generated saved entries.
- Write code that adapts to the user’s technology: The page uses semantic HTML, standard CSS, and regular JavaScript without requiring a JavaScript framework. The viewport meta tag supports mobile devices, and CSS uses flexible widths such as width: min(100%, 700px).
- Don’t use color alone to convey information: The website communicates actions with text labels such as “Saved,” “Delete,” and “Edit.” Password matching is also output as a text value rather than relying only on color.
- Provide easily identifiable feedback: The #auth-message element is assigned a role="alert". A successful login updates the status text to “Logged in as...”, and editing changes the Submit button text to “Update”