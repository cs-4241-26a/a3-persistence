const login = async function() {
    console.log("running login")
    const mode = document.querySelector( '#option' ),
        username = document.querySelector( '#username' ),
        password = document.querySelector( '#password' ),
        json = {mode: mode.value, username: username.value, password: password.value}

    const response = await fetch( '/login', {
        method:'POST',
        headers: { 'Content-Type':'application/json' },
        body: JSON.stringify( json ) 
    })

    const text = await response.text()

    console.log("response", text)

    // If response was 200 OK redirect, if not show given error message
    const errorMessage = document.querySelector( '#error' )
    console.log("status", response.status)
    if (response.status == 200) {
        // I was adding and removing hidden but I think it makes more sense to add remove alert and the text for the error
        errorMessage.setAttribute("role", "")
        errorMessage.innerText = " "
        window.location.href = '/home.html'
    }
    else {  
        errorMessage.setAttribute("role", "alert")
        errorMessage.innerText = text
    }
}
