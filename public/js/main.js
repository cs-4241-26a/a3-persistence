const pages = {
  'nav-home': 'page-home',
  'nav-cars': 'page-cars',
  'nav-sell': 'page-sell',
  'nav-reviews': 'page-reviews'
}

let carEstimates = [
  { model: 'Toyota', year: 1999, color: 'red', mpg: 23, price: 9500 },
  { model: 'Honda', year: 2004, color: 'blue', mpg: 30, price: 24000 },
  { model: 'Ford', year: 1987, color: 'grey', mpg: 14, price: 5000 }
]

const loadCars = function () {
  const container = document.getElementById('car-estimates')
  if (!container) return

  container.innerHTML = ''
  const ul = document.createElement('ul')
  ul.className = 'single-car'

  carEstimates.forEach( (item, index) => {

    const li = document.createElement( 'li' )
    li.innerText = `Model: ${item.model}, Year: ${item.year}, Color: ${item.color}, MPG: ${item.mpg}, `
    
    const price = document.createElement('span')
    price.className = 'price'
    price.textContent = `Our Price: $${item.price}`

    const deleteButton = document.createElement( 'button' )
    deleteButton.innerText = "Delete"
    deleteButton.className = "delete-button"
    deleteButton.onclick = () => deleteCar(index)
    
    li.appendChild( price )
    li.appendChild( deleteButton )
    ul.appendChild( li )
  })
  container.appendChild(ul)
}

const calculateStats = function( yearString ) {
  const year = parseInt(yearString, 10)
  let max_mpg, min_mpg = 0

  if (year <= 2000) {
    max_mpg = 25
    min_mpg = 10
  }
  else if (year <= 2010) {
    max_mpg = 30
    min_mpg = 15
  }
  else {
    max_mpg = 35
    min_mpg = 20
  }

  const mpg = Math.floor(Math.random() * (max_mpg - min_mpg)) + min_mpg

  const price = mpg * (1000) - ( (2026 - year) * 500 )

  if ( price < 5000 ) { price = 5000 }

  return { mpg, price }
}

const submitCar = async function( event ) {
  // stop form submission from trying to load
  // a new .html page for displaying results...
  // this was the original browser behavior and still
  // remains to this day
  if (event) event.preventDefault()
  
  const model = document.querySelector( '#model' ),
        year = document.querySelector( '#year' ),
        color = document.querySelector( '#color' ),
        { mpg, price } = calculateStats(year.value)
  
  carEstimates.push({
    model: model.value,
    year: year.value,
    color: color.value,
    mpg: mpg,
    price: price
  })

  model.value = ''
  year.value = ''
  color.value = ''

  loadCars()
}

const deleteCar = async function ( index ) {
  carEstimates.splice(index, 1)
  loadCars()
}

const loadReviews = async function() {
  try {
    const response = await fetch('/api/reviews')
    if (!response.ok) return
    const reviews = await response.json()
    const container = document.getElementById('reviews')
    if (!container) return

    container.innerHTML = reviews.map(r => `
      <div class="list-group-item d-flex align-items-flex-start text-start gx-3">
        <img src="${r.profilePicURL || 'blank-pfp.png'}" width="60" height="60" class="rounded-circle">
        <div>
          <h4>${r.displayName}</h4>
          <p class="text-wrap">${r.comment}</p>
          <p>${new Date(r.createdAt).toLocaleDateString()}</p>
        </div>
      </div>
    `).join('')

  }
  catch (err) {
    console.error('Could not fetch reviews from database: ', err)
  }
}

const submitReview = async function( event ) {
  if (event) event.preventDefault()
  const comment_textbox = document.getElementById('review-textbox')
  const comment = comment_textbox.value

  const response = await fetch('/api/reviews', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ comment })
  })

  if (response.ok) {
    comment_textbox.value = ''
    await loadReviews()
  }
  else {
    alert("Failed to submit, are you logged in?")
  }
}

const checkAuth = async function() {
  try {
    const response = await fetch('/api/user')
    const loggedIn = await response.json()

    const button = document.getElementById('login-button')
    if (loggedIn.authenticated) {
      button.classList.add('d-none')
    }
    else {
      button.classList.remove('d-none')
    }
  }
  catch (err) {
    console.error('Could not fetch auth from server.js: ', err)
  }
}

window.onload = function() {
  Object.keys(pages).forEach(navID => {
    document.getElementById(navID).addEventListener('click', (e) =>{
      e.preventDefault()
      document.querySelectorAll('.page').forEach(section => section.classList.add('d-none'))
      document.getElementById(pages[navID]).classList.remove('d-none')
    })
  })

  const sell_car = document.querySelector('#page-sell form')
  if (sell_car) {
    sell_car.onsubmit = submitCar
  }

  const submit_review = document.getElementById('review-form')
  if (submit_review) {
    submit_review.onsubmit = submitReview
  }

  loadCars()
  loadReviews()
  checkAuth()
}
