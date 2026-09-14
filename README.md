Aidan Fisher
https://a3-aidan-fisher.onrender.com/

This is an expense tracker app which was made ontop of my assignment 2 work. You can log in or create an account by entering a new login and password that is not yet in the system. After logging in you can add, edit and delete expenses. Data is stored in MongoDB so it saves when the server is restarted and each user only sees the expenses they have input.

The goal was to be comfortable using Express, a real database and a basic login page built ontop of the already working expense tracker from A2

Authentication: I used a username and password login. If the username doesn't exists in the system, a new account is created automatically with the password that is entered. I chose this over OAuth because I started this assignment late and did not have time to do all of the OAuth requirements.

CSS framework: I used Bootstrap, since it is commonly used and easy to add with a single CDN link. I applied it to the form, the table and page layout.

## Technical Achievements
- **Express server**: Converted the A2 server from raw Node http to Express, using app.get/app.post routes and express.static for serving files.
- **MongoDB persistence**: Expenses are stored in a MongoDB Atlas database instead of an in-memory array, so data survives server restarts.
- **User accounts and sessions**: Added a login page, a users collection, and express-session to track who's logged in. Each expense is tied to a username field, and all routes only return/modify data belonging to the currently logged-in user.
- **Derived field carried over from A2**: Every expense still gets an automatic spendLevel field (Low/Medium/High) calculated from its amount.

## Design/Evaluation Achievements
- **Bootstrap**: Used Bootstrap 5 for styling instead of hand-written CSS, applied throughout the form, table, and page layout.
- **Lighthouse scores**: Performance 96, Accessibility 96, Best Practices 96, SEO 90 (all above the 90% requirement).