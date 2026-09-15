// FRONT-END (CLIENT) JAVASCRIPT HERE

const submit = async function( event ) {
  // stop form submission from trying to load
  // a new .html page for displaying results...
  // this was the original browser behavior and still
  // remains to this day
  event.preventDefault()
  
  const firstNameInput = document.querySelector('#firstname')
  const lastNameInput = document.querySelector('#lastname')
  const ageInput = document.querySelector('#age')

  const json = {
    firstName : firstNameInput.value,
    lastName : lastNameInput.value,
    age : ageInput.value
  }

  const body = JSON.stringify( json )

  const response = await fetch( '/submit', {
    method:'POST',
    headers : {
      'Content-Type' : 'application/json'
    },
    body: body
  })

  const data = await response.json()

  console.log( 'data:', data )
  displayDatabase( data )
  
  firstNameInput.value = ''
  lastNameInput.value = ''
  ageInput.value = ''
}

const displayDatabase = function( data ) {
  const list = document.querySelector('#names')

  list.innerHTML = ''

  data.forEach(function( person ) {
    const item = document.createElement('li')

    item.classList.add(
      'list-group-item',
      'd-flex',
      'justify-content-between',
      'align-items-center'
    )

    item.textContent = `${person.firstName} ${person.lastName}, Age: ${person.age}, Birth Year: ${person.birthYear}`
    list.appendChild(item)

    const buttonContainer = document.createElement('div')
    buttonContainer.classList.add('d-flex', 'gap-2')

    const deleteButton = document.createElement('button')

    deleteButton.textContent = 'Delete'
    deleteButton.classList.add('btn', 'btn-danger', 'btn-sm')

    deleteButton.onclick = async function() {
      const response = await fetch( `/delete/${person._id}`, {
        method: 'DELETE'
      })

      const updatedData = await response.json()
      displayDatabase(updatedData)
    }

    const updateButton = document.createElement('button')
    updateButton.textContent = 'Update'

    updateButton.classList.add('btn', 'btn-warning', 'btn-sm')

    updateButton.onclick = async function() {
      const newFirstName = prompt('Enter new first name:', person.firstName)
      const newLastName = prompt('Enter new last name:', person.lastName)
      const newAge = prompt('Enter new age:', person.age)

      const response = await fetch( `/update/${person._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ firstName: newFirstName, lastName: newLastName, age: newAge })
      })

      const updatedData = await response.json()
      displayDatabase(updatedData)
    }

    buttonContainer.appendChild(deleteButton)
    buttonContainer.appendChild(updateButton)

    item.appendChild(buttonContainer)

    list.appendChild(item)
  })
}

const checkLogin = async function() {
  const response = await fetch('/user')
  const data = await response.json()

  const loginLink = document.querySelector('#login-link')
  const loggedInSection = document.querySelector('#logged-in-section')
  const appSection = document.querySelector('#app-section')
  const username = document.querySelector('#username')

  if (data.loggedIn) {
    loginLink.style.display = 'none'
    loggedInSection.style.display = 'block'
    appSection.style.display = 'block'

    username.textContent = data.user.username

    loadDatabase()
  } else {
    loginLink.style.display = 'inline'
    loggedInSection.style.display = 'none'
    appSection.style.display = 'none'
  }
}

const loadDatabase = async function() {
  const response = await fetch( '/data' )
  
  if (!response.ok) {
    return
  }

  const data = await response.json()
  displayDatabase(data)
}

window.onload = function() {
  const form = document.querySelector('#person-form')
  form.addEventListener('submit', submit)
  checkLogin()
}
