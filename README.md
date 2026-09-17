
---

## What is my Zodiac sign

A link to your project running on render.

Include a very brief summary of your project here. Images are encouraged, along with concise, high-level text. Be sure to include:

- The goal is to allow users to create an account, log in, enter their birthday and find their zodiac sign. Users can save mutiple zodiac records and modifying or delete them. 
- Main challange was connecting my putting my user data into the data base. Another challenge was implementing the CRUD functionality. I needed to create separate server routes for adding, retrieving, modifying, and deleting zodiac records while making sure that users could only modify or delete records associated with their own account.
- Did choose session-based authetication, cause it seemed easier.
- what CSS framework you used and why:
 
 main{
      display: grid; 
      place-items: center; 
    }
     body{
      font-family: Merriweather; 
      background-color: #4575D4;
      color: #000000;


    }
    header{
      place-items: center; 
      min-height: 30px; 
      padding-top: 150px;
    }
    h1{
      font-size: 50px;
    }
    p{
      text-align: center;
    }
    #zodiacForm{
      display: grid;
      gap: 10px;
    }
    button{
      padding: 10px;
      cursor: pointer;
    }

    The CSS srameworks were chosen for accessibility, such as having a darker color font on a lighter color background to increase readability. 

## Technical Achievements
- **Tech Achievement 1**: 
-Session based auth
-Persistent MongoDB store that stores users and people
- CRUD funcionality:
User can Create a user name or add a new zodiac record 
User can READ their past zodiac record 
User can Update their birthday
user can Delete any zodiac record 

### Design/Evaluation Achievements
- **Design Achievement 1**: 
- CSS grid, constsnat spacing for organizing. 
-Lighthouse Evaluation 100%