let editId = null

const getJson = async function( url, options ) {
  const response = await fetch( url, options )
  if( response.status === 401 ) {
    window.location.href = '/login.html'
  }
  return response.json()
}

const loadUser = async function() {
  const user = await getJson( '/user' )

  document.querySelector( '#username' ).textContent = user.username
  if( user.newUser ) {
    document.querySelector( '#welcome' ).hidden = false
  }
}

// getting the dataset, add it to the page
const loadData = async function() {
  const todos = await getJson( '/data' )
  render( todos )
}

// send post to server and send it back for redraw
const postData = async function( url, json ) {
  const result = await getJson( url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify( json )
  })

  const message = document.querySelector( '#message' )
  if( result.error !== null ) {
    message.textContent = result.error
  }

  else {
    message.textContent = ''
  }

  if( result.todos ) {
    render( result.todos )
  }
}

// grab input task
const submit = function( event ) {
  event.preventDefault()

  const json = {
    task: document.querySelector( '#task' ).value,
    notes: document.querySelector( '#notes' ).value,
    priority: document.querySelector( 'input[name="priority"]:checked' ).value,
    important: document.querySelector( '#important' ).checked
  }

  if( editId === null ) {
    postData( '/add', json )
  }

  else {
    json.id = editId
    postData( '/edit', json )
  }

  document.querySelector( '#addForm' ).reset()
}

const startEdit = function( todo ) {
  editId = todo._id

  document.querySelector( '#task' ).value = todo.task
  document.querySelector( '#notes' ).value = todo.notes
  document.querySelector( 'input[name="priority"][value="' + todo.priority + '"]' ).checked = true
  document.querySelector( '#important' ).checked = todo.important
  document.querySelector( '#submitButton' ).textContent = 'Save Changes'
  document.querySelector( '#task' ).focus()
}

// draw the three lists
const render = function( todos ) {
  const openList = document.querySelector( '#open' ),
        closedList = document.querySelector( '#closed' ),
        doneList = document.querySelector( '#done' )

  openList.innerHTML = ''
  closedList.innerHTML = ''
  doneList.innerHTML = ''

  for( let i = 0; i < todos.length; i++ ) {
    const todo = todos[ i ]
    const item = makeItem( todo )

    if( todo.list === 'open' ) {
      openList.appendChild( item )
    }

    else if( todo.list === 'closed' ) {
      closedList.appendChild( item )
    }

    else {
      doneList.appendChild( item )
    }
  }
}

// build one <li> for one task
const makeItem = function( todo ) {
  const item = document.createElement( 'li' )
  item.className = 'list-group-item text-break'

  const text = document.createElement( 'div' )
  text.className = 'fw-semibold'
  text.textContent = todo.task + ' (' + todo.priority + ', due ' + todo.deadline + ')'
  item.appendChild( text )

  const details = document.createElement( 'div' )
  details.className = 'small mb-2'
  details.textContent = 'Created: ' + todo.created + ' | Important: ' + ( todo.important ? 'Yes' : 'No' ) + ' | Notes: ' + ( todo.notes || 'None' )
  item.appendChild( details )

  const buttons = document.createElement( 'div' )
  buttons.className = 'text-end'

  // changing buttons depending on which list
  if( todo.list === 'open' ) {
    buttons.appendChild( makeButton( 'Start', function() {
      postData( '/move', { id: todo._id, list: 'closed' } )
    }))
  }

  else if( todo.list === 'closed' ) {
    buttons.appendChild( makeButton( 'Done', function() {
      postData( '/move', { id: todo._id, list: 'done' } )
    }))
    buttons.appendChild( makeButton( 'Back', function() {
      postData( '/move', { id: todo._id, list: 'open' } )
    }))
  }

  else {
    buttons.appendChild( makeButton( 'Reopen', function() {
      postData( '/move', { id: todo._id, list: 'open' } )
    }))
  }

  // editing task text (can occur to all items)
  buttons.appendChild( makeButton( 'Edit', function() {
    startEdit( todo )
  }))

  // deleting items (can occur to all items)
  buttons.appendChild( makeButton( 'Delete', function() {
    if( editId === todo._id ) {
      document.querySelector( '#addForm' ).reset()
    }
    postData( '/delete', { id: todo._id } )
  }))

  item.appendChild( buttons )
  return item
}

// helper to make a button
const makeButton = function( label, action ) {
  const button = document.createElement( 'button' )
  button.className = 'btn btn-sm btn-outline-dark ms-1'
  button.textContent = label
  button.onclick = action
  return button
}

window.onload = function() {
  const form = document.querySelector( '#addForm' )
  form.onsubmit = submit
  form.onreset = function() {
    editId = null
    document.querySelector( '#submitButton' ).textContent = 'Add Task'
  }

  loadUser()
  loadData()
}
