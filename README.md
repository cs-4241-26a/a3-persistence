
## Warhammer Score Tracker

https://a3-lukeciarletta.onrender.com

I made this application to track scores for games of Warhammer 40,000, which is a tabletop wargame set in the far future. Users can input the name, score, and the faction played for themselves and their opponent. The most challenging part of the assignment was integrating with MongoDB, as it required rewriting my endpoints and restructuring some of my client-side code. I decided to implement simple authentication with usernames and passwords stored in the database. While this poses security issues (passwords are stored in plain text), I decided it was easier to implement than a more complex custom system or an OAuth integration. I used the Picnic CSS framework to style my application. After trying several, I decided it was the most modern and the best fit for my website. I added some custom CSS for styling individual elements, such as positioning the header and logout button and formatting the game input form as a grid. I also kept my custom CSS that is modified by the JS to show the modifying game instructions and highlight the selected game when the modify button is pressed.

To create an account and access the application, enter any unused username into the login field and press enter to go to the new account page. Alternatively, log in with the existing credentials below.

- Username: user-a3
- Password: iamapassword

## Technical Achievements
- **100 Lighthouse Score:** My main content page scores 100 on all four Lighthouse characteristics.

### Design/Evaluation Achievements
- **W3C Accessibility**: I used the following tips from the W3C Web Accessibility Initiative
    
    **Writing:**
    - Page titles: I added descriptive titles to each of my 4 pages, with the page name coming before the website name
    - Headings: My login page (index) and the main page both use headings to group their content (main page uses them to separate new game form from existing games table)
    - Meaningful alt text: The two images used in my form for deleting and modifying have alt text that describes their purpose
    
    **Designing:**
    - Color alternatives: the currently modifying game is indicated with an * instead of purely by the red background
    - Interactive elements: all interactive elements appear disctinctly as buttons with styling provided by the picnic framework and use either the button or input semantic tags
    - Label placement: All of my form inputs (on login, new-account, and main pages) have labels either directly above or directly to the left of the text box
    - Group related content: my main page uses headings to separate the two sections, with noticable whitespace between them
    
    **Developing:**
    - Labels with form controls: All of my form elements (except for submit buttons) have labels using the for and id attributes
    - Include alt text: Both images used (delete and modify icons) have associated alt text
    - Page language: all of my pages are identified with lang="en"
    - Reading and code order: The reading order of the site matches the code order. An example of this is the game input form, where the code order matches the reading order of user's name -> opponent's name -> user's score -> etc.
    - Keyboard interaction: each page can be navigated with the keyboard using the tab key. To facilitate this, I added tabindex="-1" to the logout button to avoid it and the anchor tag it is nested in both receiving focus.
