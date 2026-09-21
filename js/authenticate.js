const checkAuth = async function() {
  const response = await fetch('/user')
  const data = await response.json()

  if (!data.loggedIn) {
    window.location.href = '/login.html'
  }
}

document.querySelector('#logout-btn').onclick = async function() {
  await fetch('/logout', { method: 'POST' })
  window.location.href = '/login.html'
}

checkAuth()