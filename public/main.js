// FRONT-END (CLIENT) JAVASCRIPT HERE
let ul = null

async function handleLogin(){
  const usernameInput = document.getElementById('usernameInput')
  const passwordInput = document.getElementById('passwordInput')
  const payload = { username: usernameInput.value, password: passwordInput.value }
      const response = await fetch('/login', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify(payload)
      })
      if (response.ok){
        window.location.href = response.url
      } else{
        const errorDiv = document.createElement('div')
        errorDiv.className = 'alert alert-danger mt-3' 
        errorDiv.innerHTML = `<p class="mb-0">Invalid login, press "create account" to make an account with these credentials</p>`
        document.getElementById('loginForm').appendChild(errorDiv)
      }
}
async function handleRegister(){
  const usernameInput = document.getElementById('usernameInput')
  const passwordInput = document.getElementById('passwordInput')
  const makeUserButton = document.getElementById('makeUser')
  const payload = { username: usernameInput.value, password: passwordInput.value }
      const response = await fetch('/register', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify(payload)
      })
  const data = await response.json()
  const alertDiv = document.createElement('div')
  alertDiv.id = 'loginErrorMessage'
  alertDiv.className = response.ok ? 'alert alert-success mt-3' : 'alert alert-danger mt-3'
  alertDiv.innerHTML = `<p class="mb-0">${data.message}</p>`
  if (makeUserButton && makeUserButton.parentNode) {
    makeUserButton.parentNode.insertBefore(alertDiv, makeUserButton.nextSibling)
  } else {
    document.body.appendChild(alertDiv)
  }
}
