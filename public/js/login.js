const onSubmit = async function(event){
    event.preventDefault()
    const username = document.querySelector('#username').value
    const password = document.querySelector('#password').value
    const loginError = document.querySelector('#login-error')
    loginError.classList.add('d-none')

    const response = await fetch('/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
    })
    const data = await response.json()
    if (!response.ok) {
        loginError.textContent = data.message || 'Login failed'
        loginError.classList.remove('d-none')
        return
    }
    if(data.isNewAccount) {
        alert('New account created successfully!')
    }
    // Redirect to the main page or dashboard after successful login
    window.location.href = '/app.html'
}

window.onload = function() {
    document.querySelector('#login-form').addEventListener('submit', onSubmit)
}