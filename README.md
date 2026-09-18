## Math Maker - A Math Quiz App

https://a3-brody-graham.onrender.com/login.html

**Login Credentials**:
- Username: MoCuttas42
- Password: EnterSandman

The goal of this app is to provide a simple game for users to practice basic math problems. Users register an account and answer math questions. The app tracks their total guesses and correct guesses as they play over multiple sessions. 

The biggest challenge I faced was implementing a proper User Authentication system. There were so many components to this system: connecting to and manipulating player data in the database, keeping track of the logged in user with session cookies, but most time consuming was accounting for all the possible use cases a user might have with their profile: registering a profile (and failing if the username was already taken), attempting to log in, failing login if the username didn't exist or password was wrong, modifying user data and taking care of missing fields if necessary, and deleting a user. It was all very tedious, but I believe I created a decent user experience. 

For authentication, I used the Express.js session-cookies middleware to store a username on the client so that data could be requested for that user, and I used a basic system of storing usernames and passwords in my database. This felt like the easiest approach for me to handle, and the one that would cause the least confusion and frustration trying to debug third-party code. 

For CSS Framework, I used Beer.css because I like beer. The framework proved to be simple to use as I could just add class names to each element I wanted to modularly change their style. I have a Colors.css file to declare the color pallete for the app. 

### Design/Evaluation Achievements
- **Design Achievement 1**: I followed the following tips from the W3C Web Accessibility Initiative:
  - **Provide informative, unique page titles**: Each Web Page in my app has a title in the format of "*function of website* - Math Maker. The titles are as follows
    - Login - Math Maker
    - Register a New Profile - Math Maker
    - Solve Problems - Math Maker
    - Change your Profile Info - Math Maker!
  - **Use headings to convey meaning and structure**: The Login and Profile Edit page has headers to seperate different forms. Login Page uses Headers to seperate Login and Register forms, and Profile Edit page has headers to seperate the edit form and the delete profile button.
  ![Headers showing structure on Edit Profile Page](ReadeMePics\HeadersAccessibility.png)
  ![Headers showing structure on Login Page](ReadeMePics\HeadersLogin.png)

  - **Provide clear instructions**: Profile Registration, Login, and Profile Change forms all show error messages when form data is entered incorrectly.
  ![](ReadeMePics\Acc_Instructions_Registration.png)
  ![](ReadeMePics\Acc_Instructions_Login.png)
  ![](ReadeMePics\Acc_Instructions_Login2.png)
  ![](ReadeMePics\Acc_Instructions_Modify.png)

  - **Ensure that interactive elements are easy to identify**: All interactive buttons are a distinct green color that contrasts well from the background color they are on, and change styles on mouse hover and focus.

  - **Provide clear and consistent navigation options**: Navigation to other web pages is consistently in the top navbar with buttons that clearly indicate which sites they navigate to. The Registration Screen has a "Back To Login" button in its navbar, the Main Game Page has buttons to navigate to Modifying the Profile and to log out, and the modify profile page has a clear "back to main game" button.

  - **Provide easily identifiable feedback**: Form data like Login, register, and modify data displays error messages when invalid data is given (See instruction pictures above). Also, when the user answers a problem, they are given a "Correct" or "Incorrect" banner for four seconds on screen. 
  ![](ReadeMePics\Acc_Feedback_Answer.png)


## Technical Achievements
- **Tech Achievement 1**: Express Middleware Packages Installed and used:
  - cookie-session: Used for tracking if a user is logged in and authenticated. Session cookies keep track of the username, and uses it to fetch database data. 

- **Tech Achievement 2**: I achieved 100% on all Lighthouse Categories for all available webpages. See the images below.

![Lighthouse score on Login Page](ReadeMePics\LoginScore.png)
![Lighthouse score on Account Registration Page](ReadeMePics\RegisterScore.png)
![Lighthouse score on Main Game Page](ReadeMePics\MainGameScore.png)
![Lighthouse score on Edit Profile Page](ReadeMePics\CHangeInfoScore.png)
