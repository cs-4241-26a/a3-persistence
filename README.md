https://a3-dennisliu.onrender.com/

## Basic Online Homework Tracker
Keeps track of homework assignments and calculates urgency based on available data entered into the task (Will be skipped if insufficent data supplied) Each entry is associated with a user account and is not globally visable.

Some challenges faced was the fact that it was based off of project-2 rather than starting from scratch, a lot of code was not designed with authentication, database and express and had to be extensively rewritten and modified. Authentication also was a point of difficulty and while is functional for this assignment, some bugs still remain (most notably the lack of re-direct when trying to access restricted apis while signed out). It was also difficult to keep track of proper security and there are some issues that have not been resolved that technically allows (but very unlikely) the modification of other users data from a different user.

I used passport.js with the GitHub strategy because I thought it would be cool and useful in the future.

I used Pure CSS which stylized all forms and buttons for my website. I chose this because my website was already extensively styled with existing CSS and to restyle it with a CSS framework would actually take a significant more amount of time. I chose a compromise by simplying aspects of what was already there and implemented Pure CSS to style anything that was not styled to begin with. -- The only override was to make the primary button color for Pure CSS slightly darker.

**Important information**: 
- Webpage will not work without authentication, you must login for it to function correctly.
- App page will not redirect you to login if you are not logged in, you must manually go to the login page (index page) to login before continuing.
- Lighthouse test must be conducted while signed in, it will through errors otherwise.
- Lighthouse test most accurate with no extensions - usually private/incognito will disable them.

## Technical Achievements
- **Tech Achievement 1:**: Implemented OAuth authentication with GitHub strategy.

- **Tech Achievement 2:**: 100% lighthouse test reached on all 4 catagories required.

- **Tech Achievement 3:**: Uses mutitude of middleware packages:
1) passport - Abstracts most of the implentation for authentication with external authentication providers.
2) session - Keeps track of what users are currently logged in (keeps authentication between requests and gives user cookies).
3) compression - Applies compression (gzip) to files to in an attempt to conserve bandwith and speed up network downloads.
4) Favicon - Includes favicon globally to all pages.
5) morgan - Logs incoming server traffic at far greater detail (with information such as user-agent string and request type).


### Design/Evaluation Achievements
- None
