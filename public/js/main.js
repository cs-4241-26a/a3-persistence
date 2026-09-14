// FRONT-END (CLIENT) JAVASCRIPT HERE
let container = null
let editingId = null

const submit = async function( event ) {
  // stop form submission from trying to load
  // a new .html page for displaying results...
  // this was the original browser behavior and still
  // remains to this day
  event.preventDefault()

  console.log( 'submit button clicked' )

  const website_input = document.querySelector( '#website' )
  const username_input = document.querySelector( '#username' )
  const password_input = document.querySelector( '#password' )
  
  const body = JSON.stringify({
    id: editingId,
    website: website_input.value,
    username: username_input.value,
    password: password_input.value
  })
  const method = editingId === null ? 'POST' : 'PUT'
  const endpoint = editingId === null ? '/submit' : '/edit'
  
  const response = await fetch( endpoint, {
    method,
    headers: {
      'Content-Type': 'application/json'
    },
    body
  })

  const arr = await response.json()
  editingId = null
  document.querySelector('form button').innerText = 'Submit'
  renderEntries( arr )
}

const loadEntries = async function() {
  const response = await fetch( '/data' )
  renderEntries( await response.json() )
}

const renderEntries = function( arr ) {
  container.innerHTML = ''

  // this creates a header row for the output table
  const header = document.createElement('div')
  header.classList.add('output-row', 'output-header')
  for ( let value of [ 'Website', 'Username', 'Password', 'Duplicate Pass?', 'Delete', 'Edit' ] ) {
    const field = document.createElement('div')
    field.classList.add('output-cell')
    if ( value === 'Delete' || value === 'Edit' ) {
      field.classList.add('output-action-placeholder')
    }
    field.innerText = value
    header.appendChild(field)
  }
  container.appendChild( header )

  for ( let item of arr ) {
    const child = document.createElement('div')
    const website = item.website ?? ''
    const name = item.username ?? ''
    const pass = item.password ?? ''
    const passwordMatchesPrevious = item.passwordMatchesPrevious ?? false
    child.classList.add('output-row')

    for ( let value of [ website, name, pass, passwordMatchesPrevious ] ) {
      const field = document.createElement('div')
      field.classList.add('output-cell')
      field.innerText = value
      child.appendChild(field)
    }

    // create a delete button for each entry
    const deleteButton = document.createElement('button')
    deleteButton.type = 'button'
    deleteButton.innerText = 'Delete'
    deleteButton.onclick = async function() {
      const response = await fetch( '/delete?id=' + encodeURIComponent( item.id ), { // this deletes the entry with the given id (which is the current item in the loop)
        method: 'DELETE'
      })
      renderEntries( await response.json() )
    }
    child.appendChild( deleteButton )

    // create an edit button for each entry
    const editButton = document.createElement('button')
    editButton.type = 'button'
    editButton.innerText = 'Edit'
    editButton.onclick = function() {
      document.querySelector( '#website' ).value = website
      document.querySelector( '#username' ).value = name
      document.querySelector( '#password' ).value = pass
      editingId = item.id
      document.querySelector('form button').innerText = 'Update'
    }
    child.appendChild( editButton )

    if ( website || name || pass ) {
      container.appendChild( child )
    }
  }
}

window.onload = function() {
  const button = document.querySelector('button')
  button.onclick = submit
  container = document.createElement( 'div' )
  container.classList.add( 'container' )
  document.body.appendChild( container )
  loadEntries()
}
