const showAlert = function( message, type ) {
  const alertBox = document.querySelector( '#login-alert' )
  alertBox.textContent = message
  alertBox.classList.remove( 'd-none', 'alert-danger', 'alert-info' )
  alertBox.classList.add( type === 'info' ? 'alert-info' : 'alert-danger' )
}

const handleLogin = async function( event ) {
  event.preventDefault()

  const username = document.querySelector( '#username' ).value.trim()
  const password = document.querySelector( '#password' ).value

  try {
    const response = await fetch( '/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify( { username: username, password: password } )
    } )

    const result = await response.json()

    if( !response.ok ) {
      showAlert( result.error || 'Login failed.', 'danger' )
      return
    }

    if( result.isNewUser ) {
      //alert the user that a new account was made for them
      alert( 'Since "' + result.username + '" didn\'t exist yet, a new account was created for you instead.' )
    }

    window.location.href = '/app.html'
  }catch( err ) {
    showAlert( 'Something went wrong with the server. Please try again.', 'danger' )
  }
}

window.onload = function() {
  document.querySelector( '#login-form' ).onsubmit = handleLogin
}
