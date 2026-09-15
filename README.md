## Messages behind doors (incomplete)

Not deployed. 

This project consists of a grid of buttons connected to dialogs, each containing a specific database entry. The concept here was a take-a-penny leave-a-penny philosophy, but with messages: users are encouraged to check a random door, read a message by another user, clear said message, and leave their own (at their door or another one). 

Features currently implemented are: login, use of express, connection to a mongodb database, the buttons and their dialogs, the ability to add a new entry, and the ability to delete an entry. the login strategy i used was the cookie-based approach that was tutorialized for us. login ended up causing a bug that took a very long time for me to fix (and still hasn't been positively identified), and the table approach was pretty difficult to wrangle. 

Features required in the assignment specs but not implemented are: modification of existing entries, view being catered to which user is logged in, implementation of a CSS framework, deployment to render, Lighthouse testing and scoring. 

valid username/password pairs are: 
ann / alpha 
bill / bravo 
darrell / delta
Emily / Echo

## Technical Achievements
- **Tech Achievement 1**: built a novel approach to displaying data that involved creation of a grid of buttons, each of which opens a dialog with the corresponding spot's message. i think this is a tech achievement because it necessitated a large amount of frontend javascript beyond the stated scope of the assignment to generate HTML at scale programmatically, and as such required more complicated interplay between the frontend and backend. in addition, although a database with no schema was used, the locations approach required my service to effectively enforce a schema (unique locations + locations bound 0-99). for these reasons, i think this approach is worth **10 points**. 