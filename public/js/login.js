const login = async function( event ) {
  event.preventDefault()

  const username = document.querySelector( '#username' ).value,
        password = document.querySelector( '#password' ).value,
        json = { username, password },
        body = JSON.stringify( json )

  const response = await fetch( '/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body
  })

  const result = await response.json()

  if( result.success ) {
    window.location.href = '/'
  } else {
    document.querySelector( '#message' ).textContent = result.message
  }
}

window.onload = function() {
  document.querySelector( '#login-form' ).onsubmit = login
}