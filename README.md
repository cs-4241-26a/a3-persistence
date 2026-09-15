## daily drinks

https://a3-evelynyee.onrender.com

This is a project designed for users to log in and keep track of drinks they have on a particular date, with the ability to add short messages for descriptive purposes.
The goal of this application is to help its users stay organized and have notes associated with dates for reflective purposes. One of the main challenges was adding the 
login/logout feature, and allowing users to only see their own data and create their own posts associated with their account.
For my authentication strategy, I used the Express.js session middleware which creates a userId when a user logs in, which was used to keep track of
posts they create, modify, or delete while logged in, because it seemed to be the simplest way to keep track of users with the use of a session ID.
I used the Tacit CSS framework because I liked the minimalist styling provided without requiring classes. I made two modifications using inline CSS styling: one to add 
a border around the text area input, and another to adjust the apperance of text after a failed login attempt.

## Technical Achievements
- **Tech Achievement 1**: I achieve a score in all four lighthouse tests required. I also used express.session middleware which allows user sessions to be tracked using an ID.

### Design/Evaluation Achievements
- **Design Achievement 1**: N/A
