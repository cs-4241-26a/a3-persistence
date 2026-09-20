# a3-ConnorDunkley

https://a3-connordunkley.onrender.com

## Summary 

The application allows users to log in and create a personalized shopping list. Users can add items, modify items, and delete items. Logins for not previously used usernames are signed up automatically. 

The most challenging part of the project was managing the user logins and ensuring that the proper behavior would take place when a user is/is not logged in. 

Users are stored in their own database collection and each shopping list item has an attached user and said item will only display for that user. When users log in, their login status and username are stored in cookies that allow them to see their personalized shopping list on main.html. I chose this option because it was easy for the server to reference the currently logged in user and provide the client with the necessary information. 

I used bootstrap for its clean and simple design. Many of its features allow for easy styling of buttons, inputs, and dropdowns, which works well for this application.

My own personal CSS is applied to the shoppig list fields, the titles, and the colors used for the background to ensure that the design is not totally alienated from my a2 design choices. 
