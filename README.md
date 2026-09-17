
---

## Workout Exercise Tracker


##!!DISCLAIMER: I talked to Professor in class, I submitted this assignment late along with a2, where a2 was submitted a couple of hours late. The Professor said that I was fine to use a late pass on this assignment, and that he excused the other one as not using the late pass. He told me to include this conversation in the readme, so I am including it here, thanks for understanding. 
render: https://a3-erisropi-1.onrender.com/ 

github: https://github.com/erisr12212/a3-erisropi


Summary:
Workout tracker modeled through a two-tier web application with a user log in screen, where user can edit, delete and add personal workouts to track their total calories burned and reps for that given exercise. Each user has access to only their exercises.

Goal:
Build a simple fitness tracker that motivates people to stay active, and what specific schedule to follow so that exercises aren't repeated to frequently. 

Challenges:
The biggest challenge was definitely mapping out the specific users workouts to only be tracked by that specific user. Controlling the sessions and who was logged in at what time was difficult, but using the cookie starter code, it was very helpful in achieving this functionality. 

Authentication strategy:
Like mentioned above, the authentication strategy was the cookie-based session. This made it easy for tracking the users, as when they submit the log in request, the server checks for a matching username in MongoDB, and if there is no username that matches it creates a new account, otherwise it checks to see if the password is correct. On success, the fields of the session login and username are set and persist in the browser which allows the user to stay loged in.

CSS framework:
The framework I used was Bootstrap, I used it because it was the simplest to me, and given in the tutorial attached in the assignment. This lead to significant improvements in the styling of the text, buttons, and overall vibe of the website. I didn't really make that many customizations on top of the bootstrap. One small thing that I changed was the buttons distance, specifically the edit and delete button of the exercises. They were very close to the text, almost overlapping so I used marginLeft and marginRight to shift them over 20px. 
## Technical Achievements
- NONE
- I did end up boosting the lighthouse score up to 98% percent, but wasn't able to get the full 100%, I was wondering if it was possible to receive partial credit, if not no worries, thanks.

### Design/Evaluation Achievements
- **CRAP ACHIEVEMENT**: 
Contrast

For both the user login page and the workout page that stores the users information, the thing that sticks out most is the submit button. Both in the workout.html and index.hml a blue submit button was added to contrast the white background. There is also a slighter contrast in the boxes where the user types in their field requirements, like username, password,and for all the fields in both the login and workout page, there are boxes around where the user types that contrast the backgroun so the user knows where to type. The delete button is also red which highly contrasts the background. This was done using Bootstrap, specifically its form-control, btn btn-primary classes, and specific btns for the red and grey color of the buttons on the workout page. 

Proximity 

Proximity was mainly used for the workout part of the website, specifically the tracking of exercises. The type of exercise, along with reps, and calories burned grouped together in a list makes it easy for the user to track the information of each of their workouts. The proximity of the buttons also makes it easy for the user to see what specific exercise each button relates to. If the user wants to edit an entry, its easy to see what button to click, as each line is dedicated fore a specific workout. List-group-item is used to group all of these together in order to make this work. Also controlling the space between each specific field of the users response in relation to the buttons was an easy on proximity that I had to fix. The buttons were to close to the text, almost overlapping so I had to margin them by 20px for it to look smoother: (deleteButton.style.marginLeft = '20px')

Repetition 

A lot of my website uses repetition, for example on the user login page the format of the username and password is the same, to not confuse the user with layout design. All of the submit buttons, edit buttons, and delete buttons are all respectively the same color throughout the documents, for example both the submit buttons in the workout and login page are the exact same. For all of the smaller texts, like username, password, workout, sets, reps, they all used the form control class which gave them all the same padding, radius highlighting. Btn class was also reused amongst all the clickable options, as it made the button more defined. Repeating this process of a button format was important to having a well designed page. The variation that did come was from the button colors. I felt like repetition would have been harmful here, because human instinct is to associate color with emotion, so the delete button being something negative, taking away, i felt it was important to make it red compared to the submit button which is adding, so I made that blue. 

Alignment

Alignment for me was mostly used to keep the page well organized. Specifically with this page, there really isn’t much going on, it is a simple workout tracker so really the only things that needed alignment were the buttons relative to the exercise and the alignment of the workout that the user has to input. Another alignment component that I previously mentioned in the proximity section was the spacing between the buttons. It was essential that each button had the same spacing between them, allowing for an alignment of the buttons relative to each other. Also, the text boxes were aligned throughout the entire length of the page. Given that the user can right arbitrary long information for each workout, if I had dynamically created the box size for entries, the alignment amongst the exercises would not have matched, so I guess that was a tradeoff I had to incorporate where the alignment matches, but having it run to the end of the page isn’t visually appealing. 

