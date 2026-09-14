let username = "Player 1"

// Logout and return to default landing page for not logged in users
const logout = async function( event ) {
    const response = await fetch( '/logout', {
        method:'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify( {} ) 
    })
    window.location.href = '/'
}

const updateUsername = async function() {
    const newUsername1 = document.querySelector( '#username1' ),
        newUsername2 = document.querySelector( '#username2' )
    if (newUsername1.value != newUsername2.value) {
        newUsername2.setCustomValidity("Your usernames must match!")
    }
    else {
        newUsername2.setCustomValidity("")
        //POST req to change username in server
        const response = await fetch( '/submit', {
            method:'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify( {option:'Change Username', newUsername:newUsername1.value} ) 
        })
    }
}

const updatePassword = async function() {
    const password1 = document.querySelector( '#password1' ),
        password2 = document.querySelector( '#password2' )
    if (password1.value != password2.value) {
        password2.setCustomValidity("Your passwords must match!")
    }
    else {
        password2.setCustomValidity("")
        //POST req to change password in server
        const response = await fetch( '/submit', {
            method:'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify( {option:'Change Password', newPassword:password1.value} ) 
        })
    }
}

const updateProfilePicture = async function() {
    //update picture from selected
    const newpfp = document.querySelector('input[name="pfp"]:checked')
    //POST req to change this  in server
    const response = await fetch( '/submit', {
        method:'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify( {option:'Change Profile Picture', pfp:newpfp.value} ) 
    })
    console.log("made it here")
}

const updateGameScore = async function() {
    const mode = document.querySelector( '#option' ),
        game = document.querySelector( '#game' ),
        score = document.querySelector( '#highscore' ),
        today = new Date().toISOString().slice(0, 10), 
        json = { option: mode.value, game: game.value, highscore: score.value, date: today}

    const response = await fetch( '/submit', {
        method:'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify( json ) 
    })

    // Do something with the response from POST
    const data = await response.text()
    // checking if data is not an error message would be ideal

    updateShownData()    
}

const updateShownData = async function() {
    // Run a get after running a post, to see if the page changes
    const response = await fetch( '/docs', {
        method:'GET'
    })
    const text = await response.text()
    // This specifically still needs to be parsed
    const data = JSON.parse(text)
    let dataToDisplay = ""
    // Data is sent back as an array with all documents 
    for (let i = 0; i < data.length; i++) {
        if (data[i].game != null) {
            dataToDisplay += "<li>"+(data[i].game+": "+data[i].highscore).replaceAll(/(<|>)/g, "")+"</li>"
        }
        //one of the elemnts sent back should contain the username so update that 
        else if (data[i].username != null) {
            username = data[i].username
            //this piece of data might also have a specific profile picture if so use it instead of default
            if (data[i].pfp != null) {
                const pfpImage = document.getElementById("profile picture")
                pfpImage.src = data[i].pfp
            }
        }
    }
    // Overwrite the displayed scoretable with the updated version after it returns
    document.getElementById('scoretable').innerHTML = dataToDisplay
    // Also update player name
    document.getElementById('welcome').innerText = `Welcome back ${username}! What would you like to do?`
}

const updateForm = async function() {
    const selection = document.querySelector('input[name="whatToDo"]:checked')
    if (selection != null) {
        if (selection.value === "1") {
            document.getElementById('home').innerHTML = getUsername     
        }
        else if (selection.value === "2") {
            document.getElementById('home').innerHTML = getPassword     
        }
        else if (selection.value === "3") {
            document.getElementById('home').innerHTML = getProfilePicture     
        }
        else if (selection.value === "4") {
            document.getElementById('home').innerHTML = getGames     
        }
        else {
            // Invalid selction for where to go so return to menu
            document.getElementById('home').innerHTML = getMenu
        }
    } 
    else {
        // There was not selection for where to go so return to menu
        document.getElementById('home').innerHTML = getMenu
    }
    
}

const getMenu = (`
    <ul>
        <li>
        <label>
            <input id = "whatToDo1" name="whatToDo" value="1" type = "radio">
            Change your Nickname 
        </label>
        </li>
        <li>
        <label>
            <input id = "whatToDo2" name="whatToDo" value="2" type = "radio">
            Change your Password
        </label>
        </li>
        <li>
        <label>
            <input id = "whatToDo3" name="whatToDo" value="3" type = "radio">
            Change your Profile picture
        </label>
        </li>
        <li>
        <label>
            <input id = "whatToDo4" name="whatToDo" value="4" type = "radio" checked>
            Add data about Games you have played
        </label>
        </li>
    </ul>
    <button class="pure-button pure-button-primary" type="button" onclick="updateForm()"> Get Started </button>
`)

const getUsername = (`
    <label for="username1"> Enter a Nickname: </label>
    <input type='text' id='username1' value=''placeholder='Please enter a new username'>
    <label for="username2"> Confirm your Nickname: </label>
    <input type='text' id='username2' value='' placeholder='Please retype your username'>
    <button class="pure-button pure-button-secondary type="button" onclick="updateForm()" >back</button>
    <button class="pure-button pure-button-primary type="button" onclick="updateUsername()" >submit</button>
`)

const getPassword = (`
    <label for="password1"> Enter a New Password: </label>
    <input type='password' id='password1' value=''placeholder='Please enter a new password'>
    <label for="password2"> Confirm your Password: </label>
    <input type='password' id='password2' value='' placeholder='Please retype your password'>
    <button class="pure-button pure-button-secondary type="button" onclick="updateForm()" >back</button>
    <button class="pure-button pure-button-primary type="button" onclick="updatePassword()" >submit</button>
`)

const getProfilePicture = (`
    <h2>Select a New Profile Picture</h2>
    <section class="pure-g">
        <label for="pfp1" class="pure-u-1-3">
            <input id = "pfp1" name = "pfp" value="images/Black Elephant.png" width="50" height="50" type=radio>
            <img src="images/Black Elephant.png" alt="Picture of a Black Elephant"> Black Elephant </img>
        </label>
        <label for="pfp2" class="pure-u-1-3">
            <input id = "pfp2" name = "pfp" value="images/Brown Dog.png" width="50" height="50" type=radio >
            <img src="images/Brown Dog.png" alt="Picture of a Brown Dog"> Brown Dog </img>
        </label>
        <label for="pfp3" class="pure-u-1-3">
            <input id = "pfp3" name = "pfp" value="images/Green Frog.png" width="50" height="50" type=radio >
            <img src="images/Green Frog.png" alt="Picture of a Green Frog"> Green Frog </img>
        </label>
        <label for="pfp4" class="pure-u-1-3">
            <input id = "pfp4" name = "pfp" value="images/Grey Panda.png" width="50" height="50" type=radio>
            <img src="images/Grey Panda.png" alt="Picture of a Grey Panda"> Grey Panda </img>
        </label>
        <label for="pfp5" class="pure-u-1-3">
            <input id = "pfp5" name = "pfp" value="images/Orange Monkey.png" width="50" height="50" type=radio >
            <img src="images/Orange Monkey.png" alt="Picture of a Orange Monkey"> Orange Monkey </img>
        </label>
        <label for="pfp6" class="pure-u-1-3">
            <input id = "pfp6" name = "pfp" value="images/Pink Pig.png" width="50" height="50" type=radio >
            <img src="images/Pink Pig.png" alt="Picture of a Pink Pig"> Pink Pig </img>
        </label>
        <label for="pfp7" class="pure-u-1-3">
            <input id = "pfp7" name = "pfp" value="images/Purple Bunny.png" width="50" height="50" type=radio>
            <img src="images/Purple Bunny.png" alt="Picture of a Purple Bunny"> Purple Bunny </img>
        </label>
        <label for="pfp8" class="pure-u-1-3">
            <input id = "pfp8" name = "pfp" value="images/Red Fox.png" width="50" height="50" type=radio >
            <img src="images/Red Fox.png" alt="Picture of a Red Fox"> Red Fox </img>
        </label>
        <label for="pfp9" class="pure-u-1-3">
            <input id = "pfp9" name = "pfp" value="images/White Cow.png" width="50" height="50" type=radio >
            <img src="images/White Cow.png" alt="Picture of a White Cow"> White Cow </img>
        </label>
    </section>
    <button class="pure-button pure-button-secondary type="button" onclick="updateForm()" >back</button>
    <button class="pure-button pure-button-primary type="button" onclick="updateProfilePicture()" >submit</button>
`)

const getGames = (`
    <label for="option"> Select Add/Modify/Delete Score: </label>
    <select id='option'>
        <option>Add Score</option>
        <option>Modify Score</option>
        <option>Delete Score</option>
    </select>
    <label for="game"> Enter Name of Game: </label>
    <input type='text' id='game' value=''placeholder='enter what game this score is for'>
    <label for="highscore"> Enter your Highscore: </label>
    <input type='text' id='highscore' value='' placeholder='enter your score here'>
    <button class="pure-button pure-button-secondary type="button" onclick="updateForm()" >back</button>
    <button class="pure-button pure-button-primary type="button" onclick="updateGameScore()" >submit</button>
`)

window.onload = async function ()  {
    updateForm()
    updateShownData()
}

