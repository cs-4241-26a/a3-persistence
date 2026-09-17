// FRONT-END (CLIENT) JAVASCRIPT HERE

window.onload = function() {
    //get the url parameters (usually for an error message)
    const urlParams = new URLSearchParams(window.location.search)
    const status = urlParams.get("status")
    //find section where error messages are logged on the page
    const badtext = document.querySelector('.errormsg')
    //if there's an error, display some text about it:
    if (status === "nouser") {
        badtext.innerText = "Error: no user found with that username. Please create a new account."
    } else if (status === "wrongpassword") {
        badtext.innerText = "Error: password incorrect. Please try again. "
    } else if (status === "userexists") {
        badtext.innerText = "Error: username is already in use. Please select a different username. "
    } else if (status === "passwordmismatch") {
        badtext.innerText = "Error: passowrd and confirmation password did not match. Please try again."
    } else if (status === "usercreated") {
        badtext.innerText = "Account successfully created. Please log in below."
    }
}