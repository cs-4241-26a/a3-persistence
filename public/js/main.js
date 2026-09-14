const form = document.querySelector('#book-form')
const list = document.querySelector('#book-list')
const message = document.querySelector('#message')
const loginForm = document.querySelector('#login-form')
const loginMessage = document.querySelector('#login-message')
const bookCount = document.querySelector('#book-count')
const signinButton = document.querySelector('#signin-button')
const signupButton = document.querySelector('#signup-button')
const logoutButton = document.querySelector('#logout-button')
const auth0LoginButton = document.querySelector('#auth0-login-button')
const usernameInput = document.querySelector('#username')
const passwordInput = document.querySelector('#password')
const userBadge = document.querySelector('#user-badge')

const getCurrentUser = () => {
  const urlUser = new URLSearchParams(window.location.search).get('user')
  if (urlUser) {
    localStorage.setItem('pageTurnerUser', urlUser)
    const nextUrl = new URL(window.location.href)
    nextUrl.searchParams.delete('user')
    window.history.replaceState({}, '', nextUrl)
    return urlUser
  }

  return localStorage.getItem('pageTurnerUser') || ''
}
const saveButton = document.querySelector('#save-button')
const cancelButton = document.querySelector('#cancel-button')

const setEditMode = (isEditing) => {
  saveButton.textContent = isEditing ? 'Update book' : 'Add book'
  saveButton.classList.toggle('btn-warning', isEditing)
  saveButton.classList.toggle('btn-primary', !isEditing)
  cancelButton.hidden = !isEditing
}

const setCurrentUser = (username) => {
  if (username) {
    localStorage.setItem('pageTurnerUser', username)
  } else {
    localStorage.removeItem('pageTurnerUser')
  }
}

const updateAuthUI = () => {
  const currentUser = getCurrentUser()
  const signedIn = Boolean(currentUser)

  signinButton.hidden = signedIn
  signupButton.hidden = signedIn
  auth0LoginButton.hidden = signedIn
  logoutButton.hidden = !signedIn
  usernameInput.disabled = signedIn
  passwordInput.disabled = signedIn

  if (signedIn) {
    usernameInput.value = ''
    passwordInput.value = ''
    loginMessage.textContent = `Signed in as ${currentUser}.`
    userBadge.textContent = `Signed in as: ${currentUser}`
    userBadge.hidden = false
  } else {
    loginMessage.textContent = 'Please sign in or sign up to continue.'
    userBadge.textContent = 'Not signed in'
    userBadge.hidden = false
  }
}

const loadBooks = async function() {
  const username = getCurrentUser()
  if (!username) {
    list.innerHTML = ''
    bookCount.textContent = '0 books'
    message.textContent = 'Log in to view your reading list.'
    updateAuthUI()
    return
  }

  const response = await fetch(`/data?username=${encodeURIComponent(username)}`)
  const books = await response.json()
  renderBooks(books)
  updateAuthUI()
}

const renderBooks = function(books) {
  list.innerHTML = books.map((book) => `
    <tr>
      <td>${book.title}</td>
      <td>${book.author}</td>
      <td>${book.pages}</td>
      <td>${book.minutesPerDay}</td>
      <td>${book.readingTime} days</td>
      <td>
        <button type='button' class='edit' data-id='${book.id}' aria-label='Edit book: ${book.title}'>Edit</button>
        <button type='button' class='delete secondary' data-id='${book.id}' aria-label='Delete book: ${book.title}'>Delete</button>
      </td>
    </tr>
  `).join('')

  bookCount.textContent = `${books.length} book${books.length === 1 ? '' : 's'}`
}

const getFormData = function() {
  return {
    username: getCurrentUser(),
    title: document.querySelector('#title').value,
    author: document.querySelector('#author').value,
    pages: document.querySelector('#pages').value,
    minutesPerDay: document.querySelector('#minutesPerDay').value
  }
}

loginForm.addEventListener('submit', async function(event) {
  event.preventDefault()

  if (getCurrentUser()) {
    loginMessage.textContent = 'Please log out before switching accounts.'
    return
  }

  const username = document.querySelector('#username').value.trim()
  const password = document.querySelector('#password').value.trim()
  const action = event.submitter?.value || 'login'

  if (!username || !password) {
    loginMessage.textContent = 'Please enter both username and password.'
    return
  }

  const endpoint = action === 'signup' ? '/signup' : '/login'
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  })

  const result = await response.json()
  if (!response.ok) {
    loginMessage.textContent = result.error || 'Authentication failed.'
    return
  }

  setCurrentUser(result.username)
  loginMessage.textContent = action === 'signup'
    ? `Account created for ${result.username}. You are now signed in.`
    : `Signed in as ${result.username}.`

  document.querySelector('#username').value = ''
  document.querySelector('#password').value = ''
  updateAuthUI()
  loadBooks()
})

auth0LoginButton.addEventListener('click', function() {
  window.location.href = '/auth/login'
})

logoutButton.addEventListener('click', function() {
  setCurrentUser('')
  form.reset()
  document.querySelector('#book-id').value = ''
  message.textContent = 'You have been logged out.'
  list.innerHTML = ''
  bookCount.textContent = '0 books'
  updateAuthUI()
  window.location.href = '/auth/logout'
})

form.addEventListener('submit', async function(event) {
  event.preventDefault()

  const username = getCurrentUser()
  if (!username) {
    message.textContent = 'Please log in before adding a book.'
    return
  }

  const id = document.querySelector('#book-id').value
  const payload = getFormData()
  const response = await fetch(id ? `/data?id=${id}&username=${encodeURIComponent(username)}` : '/data', {
    method: id ? 'PUT' : 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })

  const result = await response.json()
  if (!response.ok) {
    message.textContent = result.error || 'Request failed.'
    return
  }

  renderBooks(await (await fetch(`/data?username=${encodeURIComponent(username)}`)).json())
  form.reset()
  document.querySelector('#book-id').value = ''
  setEditMode(false)
  message.textContent = id ? 'Book updated.' : 'Book added.'
})

list.addEventListener('click', async function(event) {
  const id = event.target.dataset.id
  if (!id) return

  const username = getCurrentUser()
  if (event.target.classList.contains('delete')) {
    const response = await fetch(`/data?id=${id}&username=${encodeURIComponent(username)}`, { method: 'DELETE' })
    const result = await response.json()
    if (!response.ok) {
      message.textContent = result.error || 'Delete failed.'
      return
    }

    message.textContent = 'Book deleted.'
    loadBooks()
    return
  }

  if (event.target.classList.contains('edit')) {
    const response = await fetch(`/data?username=${encodeURIComponent(username)}`)
    const books = await response.json()
    const book = books.find((item) => String(item.id) === String(id))

    if (!book) return

    document.querySelector('#book-id').value = book.id
    document.querySelector('#title').value = book.title
    document.querySelector('#author').value = book.author
    document.querySelector('#pages').value = book.pages
    document.querySelector('#minutesPerDay').value = book.minutesPerDay
    setEditMode(true)
  }
})

document.querySelector('#cancel-button').addEventListener('click', function() {
  form.reset()
  document.querySelector('#book-id').value = ''
  setEditMode(false)
})

loadBooks()
