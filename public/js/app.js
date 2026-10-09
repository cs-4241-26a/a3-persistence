const dateFormatter = new Intl.DateTimeFormat( 'en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
const formatDate = iso => dateFormatter.format( new Date( iso ) )
const escapeHtml = str => { const d = document.createElement( 'div' ); d.textContent = str; return d.innerHTML }
const priorityColor = p => p === 'high' ? 'danger' : p === 'medium' ? 'warning' : 'success'

let editingId = null

const render = function( todos ) {
  const body = document.querySelector( '#todo-body' ),
        emptyState = document.querySelector( '#empty-state' )

  body.innerHTML = ''
  emptyState.hidden = todos.length !== 0

  todos.forEach( function( todo ) {
    const row = document.createElement( 'tr' )

    if( todo._id === editingId ) {
      row.innerHTML = `
        <td><input type="text" class="form-control form-control-sm" value="${ escapeHtml( todo.task ) }" data-edit-field="task"></td>
        <td>
          <select class="form-select form-select-sm" data-edit-field="priority">
            <option value="high" ${ todo.priority === 'high' ? 'selected' : '' }>high</option>
            <option value="medium" ${ todo.priority === 'medium' ? 'selected' : '' }>medium</option>
            <option value="low" ${ todo.priority === 'low' ? 'selected' : '' }>low</option>
          </select>
        </td>
        <td>${ formatDate( todo.deadline ) }</td>
        <td class="text-end">
          <button class="btn btn-sm btn-success" data-save="${ todo._id }">Save</button>
          <button class="btn btn-sm btn-outline-secondary" data-cancel>Cancel</button>
        </td>`
    }else{
      row.innerHTML = `
        <td>${ escapeHtml( todo.task ) }</td>
        <td><span class="badge bg-${ priorityColor( todo.priority ) }">${ todo.priority }</span></td>
        <td>${ formatDate( todo.deadline ) }</td>
        <td class="text-end">
          <button class="btn btn-sm btn-outline-primary" data-edit="${ todo._id }">Edit</button>
          <button class="btn btn-sm btn-outline-danger" data-delete="${ todo._id }">Delete</button>
        </td>`
    }

    body.appendChild( row )
  })
}

const loadTodos = async function() {
  const response = await fetch( '/api/todos' )
  if( response.status === 401 ) { window.location.href = '/login.html'; return }
  render( await response.json() )
}

const addTodo = async function( task, priority ) {
  const response = await fetch( '/api/todos', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ task, priority })
  })
  render( await response.json() )
}

const saveTodo = async function( id, task, priority ) {
  const response = await fetch( `/api/todos/${ id }`, {
    method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ task, priority })
  })
  editingId = null
  render( await response.json() )
}

const deleteTodo = async function( id ) {
  const response = await fetch( `/api/todos/${ id }`, { method: 'DELETE' })
  render( await response.json() )
}

const onSubmit = async function( event ) {
  event.preventDefault()
  const taskInput = document.querySelector( '#task' ),
        prioritySelect = document.querySelector( '#priority' )
  const task = taskInput.value.trim()
  if( !task ) return
  await addTodo( task, prioritySelect.value )
  taskInput.value = ''
}

const onTableClick = function( event ) {
  const editBtn = event.target.closest( '[data-edit]' ),
        deleteBtn = event.target.closest( '[data-delete]' ),
        saveBtn = event.target.closest( '[data-save]' ),
        cancelBtn = event.target.closest( '[data-cancel]' )

  if( editBtn )   { editingId = editBtn.dataset.edit; loadTodos(); return }
  if( cancelBtn ) { editingId = null; loadTodos(); return }
  if( deleteBtn ) { deleteTodo( deleteBtn.dataset.delete ); return }
  if( saveBtn ) {
    const row = saveBtn.closest( 'tr' )
    saveTodo(
      saveBtn.dataset.save,
      row.querySelector( '[data-edit-field="task"]' ).value.trim(),
      row.querySelector( '[data-edit-field="priority"]' ).value
    )
  }
}

window.onload = async function() {
  document.querySelector( '#todo-form' ).addEventListener( 'submit', onSubmit )
  document.querySelector( '#todo-body' ).addEventListener( 'click', onTableClick )
  document.querySelector( '#logout-btn' ).addEventListener( 'click', async function() {
    await fetch( '/logout', { method: 'POST' } )
    window.location.href = '/login.html'
  })

  const meResponse = await fetch( '/api/me' )
  if( meResponse.ok ) {
    document.querySelector( '#current-user' ).textContent = ( await meResponse.json() ).username
  }

  loadTodos()
}