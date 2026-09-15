Will Schieffer's Recipe Pinner (V2)

Find my project here: https://a3-will-schieffer.onrender.com/

The goal of this application is to allow people to save recipes from various sites that they've made in the past, or would like to make in the future. 

I used OAuth, both because I wanted the achievement, but also because I had prior experience with it from my past projects, and knew there were a lot of resources out there to help me. Authentication is only availible through github at the moment, but that's sufficent for this assignment. 

I used Bootstrap as my CSS framework, mostly because I liked it aesthetic, and wanted to try using it for a front end assignment. In the past I've used Tailwind, so I kind of wanted to try something new. I found it to be a lot of fun! There is still CSS being used to style some of the components (mostly for accessibility score), but in general it's almost all Bootstrap.

I actually had the largest challenge in getting a perfect lighthouse score, so much so that I actually gave up on it. I managed to get a perfect score on the login page, but couldn't for the life of me get 100 on the performance on my index page. I tried setting up preloading (even making a new file for it to get around helmet's restrictions) but it actually lowered my score when I tried, so I just kind of left it, and pursued a +15 with middleware and OAuth.

## Technical Achievements
- **Tech Achievement 1**: I used OAuth authentication via the GitHub strategy, specifically using passport.js.
- **Tech Achievement 2**: 5 express middleware packages were implemented and used
  - **express-session**: Manages logged-in user sessions by storing session data server-side and identifying returning requests via a cookie.
  - **passport**: Handles the authentication logic itself, plugging into Express as middleware to manage login state and integrate with the GitHub OAuth strategy.
  - **helmet**: Sets a batch of security-related HTTP response headers (like blocking the site from being framed by other domains) to guard against common web vulnerabilities.
  - **morgan**: Logs every incoming HTTP request to the console (method, path, status, response time). Hopefully this one counts since it's not functionally something the user sees, or experiences but as a developer it was super nice to have.
  - **compression**: gzips HTTP responses before sending them, reducing payload size and speeding up page loads.

### Design/Evaluation Achievements
- No design achievements were successfully completed for this assignment.
