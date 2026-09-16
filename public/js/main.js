document.addEventListener('DOMContentLoaded', function () {

  const authSection = document.getElementById('auth-section')
  const userSection = document.getElementById('user-section')
  const movieApp = document.getElementById('movie-app')

  const registerForm = document.getElementById('register-form')
  const loginForm = document.getElementById('login-form')

  const registerUsername = document.getElementById('register-username')
  const registerPassword = document.getElementById('register-password')

  const loginUsername = document.getElementById('login-username')
  const loginPassword = document.getElementById('login-password')

  const authMessage = document.getElementById('auth-message')
  const currentUsername = document.getElementById('current-user')
  const logoutButton = document.getElementById('logout-button')

  const movieForm = document.getElementById('movie-form')
  const movieInput = document.getElementById('movie')
  const genreInput = document.getElementById('genre')
  const ratingInput = document.getElementById('rating')

  const movieTableBody = document.getElementById('movie-results')
  const movieCount = document.getElementById('movie-count')
  const message = document.getElementById('message')
  const clearButton = document.getElementById('clear-button')


  function showLoggedOut() {
    authSection.classList.remove('hidden')
    userSection.classList.add('hidden')
    movieApp.classList.add('hidden')

    currentUsername.textContent = ''
    movieTableBody.innerHTML = ''
    movieCount.textContent = '0 movies'
  }


  function showLoggedIn(username) {
    authSection.classList.add('hidden')
    userSection.classList.remove('hidden')
    movieApp.classList.remove('hidden')

    currentUsername.textContent = username
  }


  function showMessage(text) {
    if (message) {
      message.textContent = text
    }
  }


  function showAuthMessage(text) {
    if (authMessage) {
      authMessage.textContent = text
    }
  }


  async function checkLogin() {
    try {
      const response = await fetch('/api/user')

      if (!response.ok) {
        throw new Error('Unable to check login status.')
      }

      const data = await response.json()

      if (data.loggedIn) {
        showLoggedIn(data.username)
        await loadMovies()
      } else {
        showLoggedOut()
      }

    } catch (error) {
      console.error('Login check error:', error)
      showLoggedOut()
      showAuthMessage('Could not connect to the server.')
    }
  }

  registerForm.addEventListener('submit', async function (event) {
    event.preventDefault()

    showAuthMessage('')

    const username = registerUsername.value.trim()
    const password = registerPassword.value

    if (!username || !password) {
      showAuthMessage('Please enter a username and password.')
      return
    }

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: username,
          password: password
        })
      })

      const data = await response.json()

      if (!response.ok) {
        showAuthMessage(data.error || 'Unable to create account.')
        return
      }

      registerForm.reset()

      showAuthMessage('')

      showLoggedIn(data.username)

      await loadMovies()

    } catch (error) {
      console.error('Register error:', error)
      showAuthMessage('Could not connect to the server.')
    }
  })

  loginForm.addEventListener('submit', async function (event) {
    event.preventDefault()

    showAuthMessage('')

    const username = loginUsername.value.trim()
    const password = loginPassword.value

    if (!username || !password) {
      showAuthMessage('Please enter a username and password.')
      return
    }

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: username,
          password: password
        })
      })

      const data = await response.json()

      if (!response.ok) {
        showAuthMessage(data.error || 'Unable to log in.')
        return
      }

      loginForm.reset()

      showAuthMessage('')

      showLoggedIn(data.username)

      await loadMovies()

    } catch (error) {
      console.error('Login error:', error)
      showAuthMessage('Could not connect to the server.')
    }
  })



  logoutButton.addEventListener('click', async function () {

    try {
      const response = await fetch('/api/logout', {
        method: 'POST'
      })

      if (!response.ok) {
        throw new Error('Unable to log out.')
      }

      showLoggedOut()

      showAuthMessage('You have been logged out.')

    } catch (error) {
      console.error('Logout error:', error)
      showMessage('Could not log out.')
    }
  })


  async function loadMovies() {

    try {
      const response = await fetch('/api/movies')

      if (response.status === 401) {
        showLoggedOut()
        return
      }

      if (!response.ok) {
        throw new Error('Unable to load movies.')
      }

      const movies = await response.json()

      displayMovies(movies)

    } catch (error) {
      console.error('Load movies error:', error)
      showMessage('Could not load movies.')
    }
  }

  function displayMovies(movies) {

    movieTableBody.innerHTML = ''

    if (!Array.isArray(movies)) {
      console.error('Expected movie array but received:', movies)
      movieCount.textContent = '0 movies'
      return
    }

    if (movies.length === 1) {
      movieCount.textContent = '1 movie'
    } else {
      movieCount.textContent = `${movies.length} movies`
    }


    movies.forEach(function (movie) {

      const row = document.createElement('tr')


      const movieCell = document.createElement('td')
      movieCell.textContent = movie.movie


    
      const genreCell = document.createElement('td')
      genreCell.textContent = movie.genre



      const ratingCell = document.createElement('td')
      ratingCell.textContent = movie.rating


      const recommendationCell = document.createElement('td')

      const recommendationBadge = document.createElement('span')

      recommendationBadge.textContent = movie.recommendation

      recommendationBadge.classList.add('recommendation')

      if (movie.recommendation === 'Must Watch') {
        recommendationBadge.classList.add('must-watch')
      } else if (movie.recommendation === 'Worth Watching') {
        recommendationBadge.classList.add('worth-watching')
      } else {
        recommendationBadge.classList.add('skip')
      }

      recommendationCell.appendChild(recommendationBadge)


      const actionsCell = document.createElement('td')

      const editButton = document.createElement('button')

      editButton.type = 'button'
      editButton.textContent = 'Edit'
      editButton.classList.add('btn', 'btn-secondary', 'btn-sm')

      editButton.setAttribute(
        'aria-label',
        `Edit ${movie.movie}`
      )

      editButton.addEventListener('click', function () {
        editMovie(movie)
      })


      const deleteButton = document.createElement('button')

      deleteButton.type = 'button'
      deleteButton.textContent = 'Delete'
      deleteButton.classList.add('btn', 'btn-danger', 'btn-sm')

      deleteButton.setAttribute(
        'aria-label',
        `Delete ${movie.movie}`
      )

      deleteButton.addEventListener('click', function () {
        deleteMovie(movie._id)
      })


      actionsCell.appendChild(editButton)
      actionsCell.appendChild(document.createTextNode(' '))
      actionsCell.appendChild(deleteButton)


      row.appendChild(movieCell)
      row.appendChild(genreCell)
      row.appendChild(ratingCell)
      row.appendChild(recommendationCell)
      row.appendChild(actionsCell)


      movieTableBody.appendChild(row)
    })
  }


  movieForm.addEventListener('submit', async function (event) {

    event.preventDefault()

    showMessage('')

    const movie = movieInput.value.trim()
    const genre = genreInput.value
    const rating = Number(ratingInput.value)


    if (!movie || !genre || rating < 1 || rating > 10) {
      showMessage(
        'Please enter a movie, genre, and rating from 1 to 10.'
      )

      return
    }


    try {

      const response = await fetch('/api/movies', {
        method: 'POST',

        headers: {
          'Content-Type': 'application/json'
        },

        body: JSON.stringify({
          movie: movie,
          genre: genre,
          rating: rating
        })
      })


      const data = await response.json()


      if (!response.ok) {

        if (response.status === 401) {
          showLoggedOut()
          return
        }

        showMessage(data.error || 'Unable to add movie.')

        return
      }

      movieForm.reset()

      showMessage('Movie added successfully.')

      await loadMovies()


    } catch (error) {

      console.error('Save movie error:', error)

      showMessage('Could not connect to the server.')
    }
  })



  async function editMovie(movie) {

    const newMovie = window.prompt(
      'Movie title:',
      movie.movie
    )

    if (newMovie === null) {
      return
    }


    const newGenre = window.prompt(
      'Genre:',
      movie.genre
    )

    if (newGenre === null) {
      return
    }


    const newRatingInput = window.prompt(
      'Rating (1-10):',
      movie.rating
    )

    if (newRatingInput === null) {
      return
    }


    const newRating = Number(newRatingInput)


    if (
      !newMovie.trim() ||
      !newGenre.trim() ||
      !Number.isFinite(newRating) ||
      newRating < 1 ||
      newRating > 10
    ) {

      showMessage(
        'Please enter a valid movie, genre, and rating from 1 to 10.'
      )

      return
    }


    try {

      const response = await fetch(
        `/api/movies/${movie._id}`,
        {
          method: 'PUT',

          headers: {
            'Content-Type': 'application/json'
          },

          body: JSON.stringify({
            movie: newMovie.trim(),
            genre: newGenre.trim(),
            rating: newRating
          })
        }
      )


      const data = await response.json()


      if (!response.ok) {

        if (response.status === 401) {
          showLoggedOut()
          return
        }

        showMessage(data.error || 'Unable to update movie.')

        return
      }


      showMessage('Movie updated successfully.')

      await loadMovies()


    } catch (error) {

      console.error('Update movie error:', error)

      showMessage('Could not update movie.')
    }
  }

  async function deleteMovie(id) {

    const confirmed = window.confirm(
      'Are you sure you want to delete this movie?'
    )

    if (!confirmed) {
      return
    }


    try {

      const response = await fetch(
        `/api/movies/${id}`,
        {
          method: 'DELETE'
        }
      )


      const data = await response.json()


      if (!response.ok) {

        if (response.status === 401) {
          showLoggedOut()
          return
        }

        showMessage(data.error || 'Unable to delete movie.')

        return
      }


      showMessage('Movie deleted successfully.')

      await loadMovies()


    } catch (error) {

      console.error('Delete movie error:', error)

      showMessage('Could not delete movie.')
    }
  }

  if (clearButton) {

    clearButton.addEventListener('click', async function () {

      const confirmed = window.confirm(
        'Are you sure you want to delete all movies from your watchlist?'
      )

      if (!confirmed) {
        return
      }


      try {

        const response = await fetch('/api/movies', {
          method: 'DELETE'
        })


        const data = await response.json()


        if (!response.ok) {

          if (response.status === 401) {
            showLoggedOut()
            return
          }

          showMessage(
            data.error || 'Unable to clear watchlist.'
          )

          return
        }


        showMessage('Watchlist cleared successfully.')

        await loadMovies()


      } catch (error) {

        console.error('Clear movies error:', error)

        showMessage('Could not clear watchlist.')
      }
    })
  }


  checkLogin()

})