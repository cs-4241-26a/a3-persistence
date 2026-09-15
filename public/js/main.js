// null means adding and a real id means editing 
let editingId = null

let submit = async function( event ) {
  // stop form submission from trying to load
  // a new .html page for displaying results...
  // this was the original browser behavior and still
  // remains to this day
  event.preventDefault()

  let authorInput    = document.querySelector( '#author' ),
      titleInput     = document.querySelector( '#title' ),
      notesInput     = document.querySelector( '#notes' ),
      yearInput      = document.querySelector( '#birthYear' ),
      statusMessage  = document.querySelector( '#status' )

  let maqams = []
  let maqamBoxes = document.getElementsByName( 'maqam' )
  for( let i = 0; i < maqamBoxes.length; i++ ) {
    if( maqamBoxes[ i ].checked ) {
      maqams.push( maqamBoxes[ i ].value )
    }
  }

  if( maqams.length === 0 ) {
    statusMessage.textContent = 'Please check at least one maqam.'
    return
  }

  let poemForm = ''
  let formRadios = document.getElementsByName( 'poemForm' )
  for( let i = 0; i < formRadios.length; i++ ) {
    if( formRadios[ i ].checked ) {
      poemForm = formRadios[ i ].value
    }
  }

  let json = {
          author: authorInput.value,
          title: titleInput.value,
          form: poemForm,
          maqams: maqams,
          notes: notesInput.value,
          birthYear: yearInput.value
        }

  // if we're editing an existing poem, include its id and hit /edit instead
  let url = editingId ? '/edit' : '/submit'
  if( editingId ) {
    json.id = editingId
  }

  let response = await fetch( url, {
    method:'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify( json )
  })

  if( response.status === 401 ) {
    statusMessage.textContent = 'Please log in with GitHub to save poems.'
    return
  }

  let data = await response.json()

  showPoems( data )
  document.querySelector( '#poem-form' ).reset()
  statusMessage.textContent = editingId ? 'Poem updated.' : 'Poem added.'

  // back to "add" mode
  editingId = null
  document.querySelector( '#poem-form button' ).textContent = 'Add Poem'
}

// builds the results table from the array of poems the server sends back
let showPoems = function( data ) {
  let tbody = document.querySelector( '#poem-rows' )
  tbody.innerHTML = ''

  data.forEach( function( poem ) {
    let row = document.createElement( 'tr' )

    row.innerHTML = `
      <td>${poem.author}</td>
      <td>${poem.title}</td>
      <td>${poem.form}</td>
      <td>${poem.maqams.join( ', ' )}</td>
      <td>${poem.era}</td>
      <td>${poem.mood}</td>
      <td>${poem.multiMaqam ? 'Yes' : 'No'}</td>
      <td>${poem.notes}</td>
      <td>
        <button class="edit-button" data-id="${poem._id}" aria-label="Edit ${poem.title}">Edit</button>
        <button class="delete-button" data-id="${poem._id}" aria-label="Delete ${poem.title}">Delete</button>
      </td>
    `

    tbody.appendChild( row )
  })

  let deleteButtons = document.querySelectorAll( '.delete-button' )

  deleteButtons.forEach( function( button ) {
    button.onclick = function() {
      deletePoem( button.dataset.id )
    }
  })

  let editButtons = document.querySelectorAll( '.edit-button' )

  editButtons.forEach( function( button ) {
    button.onclick = function() {
      let id = button.dataset.id
      startEdit( id, data )
    }
  })
}

// fills the form with an existing poem's values so it can be edited
let startEdit = function( id, data ) {
  let poem = data.find( function( p ) { return p._id === id } )

  document.querySelector( '#author' ).value = poem.author
  document.querySelector( '#title' ).value = poem.title
  document.querySelector( '#notes' ).value = poem.notes
  document.querySelector( '#birthYear' ).value = poem.birthYear

  let formRadios = document.getElementsByName( 'poemForm' )
  for( let i = 0; i < formRadios.length; i++ ) {
    formRadios[ i ].checked = formRadios[ i ].value === poem.form
  }

  let maqamBoxes = document.getElementsByName( 'maqam' )
  for( let i = 0; i < maqamBoxes.length; i++ ) {
    maqamBoxes[ i ].checked = poem.maqams.includes( maqamBoxes[ i ].value )
  }

  editingId = id
  document.querySelector( '#poem-form button' ).textContent = 'Save Changes'
  document.querySelector( '#author' ).focus()
}

// similar to submit  but hits /delete instead of /submit
let deletePoem = async function( id ) {
  if( !confirm( 'Delete this poem? This cannot be undone.' ) ) {
    return
  }

  let json = { id },
      body = JSON.stringify( json )

  let response = await fetch( '/delete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body
  })

  let data = await response.json()

  showPoems( data )
  document.querySelector( '#status' ).textContent = 'Poem deleted.'
}

// loads whatever poems are already on the server when the page first opens
let loadPoems = async function() {
  let response = await fetch( '/data' )
  let data = await response.json()

  if( data === null ) {
    return
  }

  document.querySelector( '#login-box' ).hidden = true
  showPoems( data )
}

window.onload = function() {
  let form = document.querySelector( '#poem-form' )
  form.onsubmit = submit

  if( window.location.search === '?new' ) {
    alert( 'This is your first time logging in, so a new account was created for your GitHub username.' )
  }

  loadPoems()
}
