const login = async function( event ) {
    event.preventDefault()
    //console.log("Login client function reached")
    const loginUsername = document.querySelector( '#loginUsername' ),
        loginPassword = document.querySelector( '#loginPassword' )
    const fieldsEmpty = loginUsername.value === "" || loginPassword.value === ""
    const json = {username: loginUsername.value, password: loginPassword.value}
    body = JSON.stringify( json )
    if(!fieldsEmpty){
        //console.log(JSON.parse(body))
        const response = await fetch( '/login', {
      method:'POST',
      body 
    })
    // const success = await response.json()
    // if(!success.acknowledged){
    //   console.log("Login Error!")
    // }
    if (response.redirected) {
      window.location.href = response.url;
    }
    }
    else {
        console.log("Login fields are empty!")
    }

}
// const signup = async function( event ){
//     event.preventDefault()
//     const signupUsername = document.querySelector( '#signupUsername' ),
//         signupPassword = document.querySelector( '#signupPassword' )
//     const fieldsEmpty = signupUsername.value || signupPassword.value
//     const json = {username: signupUsername, password: signupPassword}
//     body = JSON.stringify( json )

//     if(!fieldsEmpty){
//         const response = await fetch( '/login', {
//       method:'POST',
//       body 
//     })
//     const success = await response.json()
//     if(!success.acknowledged){
//       console.log("Signup Error!")
//     }
//     }
//     else {
//         console.log("Signup fields are empty!")
//     }
// }


// window.onload = async function() {

// }