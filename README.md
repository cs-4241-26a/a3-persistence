## Simple Expense Tracker

account for grader:
user: grader
pass: pass123

A link to your project running on render.
https://a3-wen-chen.onrender.com/

short project about keeping track of expenses

- the goal of the application
  - keeps track of all of you expenses
- challenges you faced in realizing the application
  - building a new app because my previous project was unfinished
- what authentication strategy you chose to use and why (choosing one because it seemed the easiest to implement is perfectly acceptable)
  - I choose to do oauth through passport and using hash comparison from bcrypt and then storing hash and user on mongodb because github auth needed an application and had not time to implement
- what CSS framework you used and why
  - I used simplecss because it was the easiest for the time

## Technical Achievements
- **Tech Achievement 1**: I used OAuth authentication via the password and username lookup in mongodb
- 100% on all lighthouse tests in google
- Express Session is used for cookie handling, passport is used for authentication

### Design/Evaluation Achievements
- **Design Achievement 1**: I followed the following tips from the W3C Web Accessibility Initiative
  - Keep content clear and concise
    - Everything is extremely consise and clear with nothing except the bare essentials and extremely easy to understand buttons that function the way you expect
  - Provide clear instructions
    - for login I have a hidden message that gets displayed when there is a error
  - Provide informative, unique page titles
    - for the main page I have a single title for the page that display what this is and says "expense tracker"
  - Associate a label with every form control
    - added a label to every single form input except for buttons
  - Reflect the reading order in the code order
    - Adjusted the display order for the expenses on the right
  - Ensure that all interactive elements are keyboard accessible
    - The login field and expense forms can also be sent with keyboard "enter" key
  - Use headings to convey meaning and structure
    - added subheadings for the expense form and expense list
- CONTRAST: I made the color of the login fields a different contrasting section and highlighted all of the button with different colors that contrasts with the plain
color of the rest of the page with both of the login buttons being yellow-orange to contrast with the white borders and black background in dark mode.
In light mode however the color changes to white background and blue buttons to contrast.  I also made the entire page extremely plain to contrast the text that is in the form and login page and lead the eyes there
- PROXIMITY: I made all elements that related to each other attached to each other. For example I make the expense form and the expense list next to each other.
The login however was different and so I added a div to seperate them and display them seperate from the rest of the form. The different fields are also implemented in this where
they are seperated from each other with padding to make them visually seperated and labels to distingush them. I also added it to the authentication form where the 
login and register button are right next to each other because they are very similar and thus they should be close to each other in proximity.
- REPETITION: The colors used were the default off-white, the light blue, yellow-orange and dark grey which came default with simpleCSS and they looked good so I had no reason to change them.
By using simpleCSS I also implemented dark mode and light mode alternating color palette and all elements share the same basic font and color palette. 
I also used the same structure for the forms where thy have a consistent label and box style for both the expense form and the login form. Automatically simpleCSS helps me
stay consistent with thickness, fontsize, fontfamily, border width, colors, recurring border rounded shape and repeats teh basic styles.
- ALIGNMENT: The alignment of teh page is something that was though out with the login at the top middle the rest of the elements are also in the center of the page
and with the login form being in a completely different alignment than the rest of the form it draws the eyes to the login form to start the program.
The expense form and the expense list and also deliberately made to be vertical so that your eyes would be drawn to the bottom where the submit button. The
expense list however was made vertical to be in alignment with the expense form so that once someone is done with the form they would naturally be drawn to the expense
list where their expenses with be listed.
