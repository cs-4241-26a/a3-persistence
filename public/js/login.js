const submit = async function(event) {
  event.preventDefault()

  const username = document.querySelector('#username').value
  const password = document.querySelector('#password').value
  const message  = document.querySelector('#message')

  const response = await fetch('/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  })

  const data = await response.json()

  if (!response.ok) {
    message.textContent = data.error
    return
  }

  if (data.status === 'created') {
    alert(data.message)
  }

  window.location.href = '/index.html'
}

window.onload = function() {
  document.querySelector('#login-form').onsubmit = submit
}