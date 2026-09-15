Assignment 3 - Persistence: Two-tier Web Application with Database, Express server, and CSS template
===

Due: September 15th, by 1:59 PM.

Readme
---

## Game Tracker

https://a3-finn-regan.onrender.com/

The goal of this website is to act as a personal library of games you've played, providing recommendations on if you like them or not. I struggled with designing the login system and managing how to only show the data of the currently logged-in user, but figured it out in the end. For authentication, users can create a username and password, and by hitting login, if that username isn't already taken, a new account is created. If it already exists, then the password is checked to ensure it is correct before logging in. I used the Bootstrap CSS framework. I opted to keep most of my CSS from A2 (since it was already clean and asthetic), but used the framework for my buttons (specifically the logout funtionality).

<img width="1912" height="865" alt="image" src="https://github.com/user-attachments/assets/70d727b9-147d-4a05-951b-13aa757b710c" />

<img width="1917" height="871" alt="image" src="https://github.com/user-attachments/assets/8f5517cf-dbe7-4fee-883e-ff55607fdf96" />

<img width="1917" height="858" alt="image" src="https://github.com/user-attachments/assets/097e019e-a7ad-4354-81a8-9a15f826d662" />


## Technical Achievements
- **Tech Achievement 1**: I achieved 100% on all 4 lighthouse tests. Note: for some reason, on my computer, when running in my regular browser, the performance score was not at 100. However, when running on the same computer in an incognito browser, the score was 100.

<img width="1917" height="875" alt="lighthouse" src="https://github.com/user-attachments/assets/8063e2bd-49c3-4e5c-8a12-c2948651f112" />


- **Tech Achievement 2**: I used some Express middleware in my website; I used cookie-session to store users' login information so the browser remembers them.


### Design/Evaluation Achievements
- **Design Achievement 1**: Iused the CRAP principles of design in the creation of my site:

Contrast: The elements with the most contrast are the logout button, since it isn’t located near many of the other items in the site, as well as the game-entry form, since it’s the main focus of the site, sits right in the middle of the screen, and is dark green on the white background. Additionally, all of the text highly contrasts with the backgrounds. Most fields are light text on a dark background (the header, logout, and game entry form). The game library section, being different from other sections as the dynamic part of the site, has black text on a light blue background. To show their differences, the login and logout buttons are inverse: login is white with dark text, logout is dark with white text.

Repetition: The different box fields mimic each other. The login page uses the same theme (background and text colors, box shape, field and button locations) as the game entry form. This is because while the user is not logged in, the login form contains fields the user is able to write in. While they are logged in, the game entry form is where they write. All of the clickable buttons are similar; rounded rectangles with text centered in the middle. The logout button’s background color is the same as the green login box and game entry form, just with a darker hue. Additionally, the same font is used for all text throughout the website, and headers/box titles are in a larger font, denoting their significance in their section.

Alignment: There are a few primary alignments throughout the site. The main alignment throughout the page is the centerline. The header text, login box (when it’s present), logout button, add game form, and game library sections are all aligned in the center of the screen. This creates a very clean through-line that starts with your eyes at the top and scanning downwards, seeing the title, description, user info, logout, input fields, and library all in order. Within the boxed (login, game form, and library), a left alignment is used for the input fields, text within the box, and the buttons. This is because once you’re in a box, reading left to right is ideal, and the alignment saves more space (and looks better) than having everything within each box be centered.

Proximity: Items on the page fit together well. First, the logout button is positioned near the top of the screen by the header, and critically, just below the username, tying those two items together. Inside of the game entry form, each line (with the words denoting what each input box is, as well as the boxes themselves) is evenly spaced, with a bit of empty space between them so your eyes can separate the different sections. Something similar can be said with the library, though the entries are all self-contained, and there is a black line separating each line of the library. Additionally, in the library box, in each row, the edit and delete buttons are next to each other, noting that they are both intractable. Over all, labels/headers are close to the content they represent.

