let usernameEntry
let firstnameEntry
let lastnameEntry
let passwordEntry

window.onload = async function(){
    console.log('Requesting User Data')
    let dataResponse = await fetch('/getPlayerProfile')
    let userData = await dataResponse.json()
    console.log(userData)

    usernameEntry = document.getElementById('username-entry')
    firstnameEntry = document.getElementById('firstname-entry')
    lastnameEntry = document.getElementById('lastname-entry')
    passwordEntry = document.getElementById('password-entry')

    // if user tried to do duplicate username
    const urlInputs = new URLSearchParams(window.location.search)
    if (urlInputs.has('user')){
        console.log('Duplicate user, showing error')
        firstnameEntry.classList.add('Invalid')
        const usernameDiv = document.getElementById('entire-username-div')
        usernameDiv.classList.add('invalid')
        usernameDiv.innerHTML = `<input type="text" name="username" value="${urlInputs.get('user')}" aria-label="Username Modify" id = "username-entry">
              <output class="invalid">The Username <strong>${urlInputs.get('user')}</strong> is already being used. Please try a different Username.</output>`
    }
    // Set field values to existing values if they exist
    usernameEntry.value = userData.username
    if (userData.firstname !== undefined)
        firstnameEntry.value = userData.firstname
    if (userData.lastname !== undefined)
        lastnameEntry.value = userData.lastname
    
    document.getElementById('delete-warning').innerHTML = `Are you sure you want to delete the profile <strong>${userData.username}</strong> and all associated data? <br> <strong>This cannot be undone.</strong>`

    document.getElementById('confirm-delete').onclick = deleteUser
}

async function deleteUser(){
    const attempt = await fetch('/profile/delete', {method: 'DELETE'})
    if (attempt.ok){
        window.location.href = '/login.html'
    }
}