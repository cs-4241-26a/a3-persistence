const todayAsString = function() {
  const now = new Date()
  return now.toISOString().split( 'T' )[ 0 ]
}

const showFormAlert = function( message, type ) {
  const alertBox = document.querySelector( '#form-alert' )
  alertBox.textContent = message
  alertBox.classList.remove( 'd-none', 'alert-danger', 'alert-success' )
  alertBox.classList.add( type === 'success' ? 'alert-success' : 'alert-danger' )
}

const clearForm = function() {
  document.querySelector( '#edit-id' ).value = ''
  document.querySelector( '#task' ).value = ''
  document.querySelector( '#priority-medium' ).checked = true
  document.querySelector( '#urgent-flag' ).checked = false
  document.querySelector( '#submit-button' ).textContent = 'Add Task'
  document.querySelector( '#cancel-edit-button' ).classList.add( 'd-none' )
}

const renderTasks = function( tasks ) {
  const tableBody = document.querySelector( '#task-table-body' )
  const countText = document.querySelector( '#task-count' )

  tableBody.innerHTML = ''
  countText.textContent = tasks.length === 0
    ? 'You have no tasks yet — add one using the form.'
    : 'Showing ' + tasks.length + ' task' + ( tasks.length === 1 ? '' : 's' ) + '.'

  tasks.forEach( function( task ) {
    const row = document.createElement( 'tr' )

    const taskCell = document.createElement( 'td' )
    taskCell.textContent = task.task
    row.appendChild( taskCell )

    const priorityCell = document.createElement( 'td' )
    const badge = document.createElement( 'span' )
    badge.className = 'badge priority-' + task.priority
    badge.textContent = task.priority
    priorityCell.appendChild( badge )
    row.appendChild( priorityCell )

    const createdCell = document.createElement( 'td' )
    createdCell.textContent = task.created
    row.appendChild( createdCell )

    const deadlineCell = document.createElement( 'td' )
    deadlineCell.textContent = task.deadline
    row.appendChild( deadlineCell )

    const actionsCell = document.createElement( 'td' )
    actionsCell.className = 'd-flex gap-2'

    const editButton = document.createElement( 'button' )
    editButton.type = 'button'
    editButton.className = 'btn btn-sm btn-outline-secondary'
    editButton.textContent = 'Edit'
    editButton.setAttribute( 'aria-label', 'Edit task: ' + task.task )
    editButton.onclick = function() { startEdit( task ) }
    actionsCell.appendChild( editButton )

    const deleteButton = document.createElement( 'button' )
    deleteButton.type = 'button'
    deleteButton.className = 'btn btn-sm btn-outline-danger'
    deleteButton.textContent = 'Delete'
    deleteButton.setAttribute( 'aria-label', 'Delete task: ' + task.task )
    deleteButton.onclick = function() { deleteTask( task._id ) }
    actionsCell.appendChild( deleteButton )

    row.appendChild( actionsCell )
    tableBody.appendChild( row )
  } )
}

// show current task list and display it
const loadTasks = async function() {
  const response = await fetch( '/api/tasks' )

  if( response.status === 401 ) {
    window.location.href = '/'
    return
  }

  const tasks = await response.json()
  renderTasks( tasks )
}

// make existing task's data modifyable
const startEdit = function( task ) {
  document.querySelector( '#edit-id' ).value = task._id
  document.querySelector( '#task' ).value = task.task
  document.querySelector( '#priority-' + task.priority ).checked = true
  document.querySelector( '#submit-button' ).textContent = 'Save Changes'
  document.querySelector( '#cancel-edit-button' ).classList.remove( 'd-none' )
  document.querySelector( '#task' ).focus()
}

// handle form submission for adding and editing tasks
const submitTask = async function( event ) {
  event.preventDefault()

  const editId = document.querySelector( '#edit-id' ).value
  const taskValue = document.querySelector( '#task' ).value.trim()
  const priorityValue = document.querySelector( 'input[name="priority"]:checked' ).value

  if( !taskValue ) {
    showFormAlert( 'Please enter a task name.', 'danger' )
    return
  }

  const payload = {
    task: taskValue,
    priority: priorityValue,
    created: todayAsString()
  }

  const url = editId ? ( '/api/tasks/' + editId ) : '/api/tasks'
  const method = editId ? 'PUT' : 'POST'

  const response = await fetch( url, {
    method: method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify( payload )
  } )

  if( response.status === 401 ) {
    window.location.href = '/'
    return
  }

  const updatedTasks = await response.json()
  renderTasks( updatedTasks )
  clearForm()
}

// Remove a task by id then redraw the table 
const deleteTask = async function( id ) {
  const response = await fetch( '/api/tasks/' + id, { method: 'DELETE' } )

  if( response.status === 401 ) {
    window.location.href = '/'
    return
  }

  const updatedTasks = await response.json()
  renderTasks( updatedTasks )
}

const loadSession = async function() {
  const response = await fetch( '/api/session' )
  const info = await response.json()

  if( !info.loggedIn ) {
    window.location.href = '/'
    return
  }

  document.querySelector( '#welcome-text' ).textContent = 'Signed in as ' + info.username
}

const handleLogout = async function() {
  await fetch( '/api/logout', { method: 'POST' } )
  window.location.href = '/'
}

window.onload = function() {
  loadSession()
  loadTasks()

  document.querySelector( '#task-form' ).onsubmit = submitTask
  document.querySelector( '#cancel-edit-button' ).onclick = clearForm
  document.querySelector( '#logout-button' ).onclick = handleLogout
}
