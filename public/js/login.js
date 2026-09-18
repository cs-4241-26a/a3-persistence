window.onload = function(){
    const loginButton = document.getElementById("login")
    //loginButton.onsubmit = attemptLogin
    document.getElementById('register-button').onclick = ()=>{window.location.href = 'register.html'}

    let urlParams = new URLSearchParams(window.location.search)
    if (urlParams.has('fail')){
        if (urlParams.get('fail') === 'nouser'){
            const usernameDiv = document.getElementById('entire-username-div')
            usernameDiv.classList.add('invalid')
            usernameDiv.innerHTML = `<input type="text" name="username" aria-label="Username Entry" id = "username-entry" value="${urlParams.get('user')}">
              <label>Username</label>
              <output class="invalid">This Username is not Registered!</output>`
        }
        else if (urlParams.get('fail') === 'password'){
            const usernameDiv = document.getElementById('entire-username-div')
            usernameDiv.innerHTML = `<input type="text" name="username" aria-label="Username Entry" id = "username-entry" value="${urlParams.get('user')}">
              <label>Username</label>`

            const passwordDiv = document.getElementById('entire-password-div')
            passwordDiv.classList.add('invalid')
            passwordDiv.innerHTML = `<input type="password" name="password" aria-label="Password Entry" id = "password-entry">
              <label>Password</label>
              <output class='invalid'>Invalid Password</output>`
              
        }
    }
}

function attemptLogin(event){
    event.preventDefault()

    const username = document.getElementById("username-entry").value
    const password = document.getElementById("password-entry").value

    console.log(`Attempting to login user ${username} with ${password}`)
}