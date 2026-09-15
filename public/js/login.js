// FRONT-END (CLIENT) JAVASCRIPT FOR THE LOGIN PAGE

const showAlert = function( message, type ) {
  const box = document.querySelector( '#alert-box' )
  box.textContent = message
  box.className = 'notification ' + type
  box.hidden = false
}

const handleLoginSubmit = async function( event ) {
  event.preventDefault()

  const username = document.querySelector( '#username' ).value.trim(),
        password = document.querySelector( '#password' ).value

  if( !username || !password ) return

  const response = await fetch( '/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  })

  const data = await response.json()

  if( !response.ok ) {
    showAlert( data.error || 'Login failed', 'is-danger' )
    return
  }

  if( data.newAccount ) {
    showAlert( `Welcome! A new account was created for "${ data.username }".`, 'is-info' )
    setTimeout( function() { window.location.href = '/app' }, 900 )
  }else{
    window.location.href = '/app'
  }
}

window.onload = function() {
  document.querySelector( '#login-form' ).addEventListener( 'submit', handleLoginSubmit )
}
