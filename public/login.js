const login = async function( event ) {
    event.preventDefault()
  
    const username = document.querySelector( '#username' ),
    password = document.querySelector( '#password' ),
    
    json = {
        username: username.value,
        password: password.value
    },
  
    body = JSON.stringify( json )
    
    const response = await fetch( '/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body
    })
  
    const result = await response.json()
    
    if (result.success) {
        if (result.created) {
            alert('Account created successfully!')
        }
        localStorage.setItem('userId', result.userId)
        window.location.href = '/index.html'
    } else {
        alert('Incorrect password.')
    }
  }
  
  window.onload = function() {
    const form = document.querySelector( '#loginForm' )
    form.onsubmit = login
}