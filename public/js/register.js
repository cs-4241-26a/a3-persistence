window.onload = function(){
    // if user tried to do duplicate username
    const urlInputs = new URLSearchParams(window.location.search)
    if (urlInputs.has('user')){
        console.log('Duplicate user, showing error')
        const usernameDiv = document.getElementById('entire-username-div')
        usernameDiv.classList.add('invalid')
        usernameDiv.innerHTML = `<input type="text" name="username" value="${urlInputs.get('user')}" aria-label="Username Entry" id = "username-entry">
              <output class="invalid">The username ${urlInputs.get('user')} is already being used. Please try a different username.</output>`
    }
}