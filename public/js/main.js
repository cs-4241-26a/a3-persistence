// FRONT-END (CLIENT) JAVASCRIPT HERE
// Talks to the server's small JSON API:
//   GET    /api/todos        -> current dataset
//   POST   /api/todos        -> add a todo, returns updated dataset
//   DELETE /api/todos/:id    -> remove a todo, returns updated dataset

const dateFormatter = new Intl.DateTimeFormat( 'en-US', {
  month: 'short',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit'
})

const formatDate = function(isoString) {
  return dateFormatter.format(new Date(isoString))
}

// -- rendering -- 

const render = function(todos) {
  const body = document.querySelector('#todo-body'),
        emptyState = document.querySelector('#empty-state')
  body.innerHTML = ''

  if(todos.length === 0) {
    emptyState.hidden = false
  }else{
    emptyState.hidden = true
  }

  todos.forEach(function(todo) {
    const row = document.createElement('tr')
 
    row.innerHTML = `
      <td>${escapeHtml(todo.task)}</td>
      <td><span class="priority-pill priority-${todo.priority}">${todo.priority}</span></td>
      <td>${formatDate(todo.created)}</td>
      <td>${formatDate(todo.deadline)}</td>
      <td class="row-actions">
        <button class="btn btn-danger" data-id="${todo.id}" type="button">delete</button>
      </td>
    `
 
    body.appendChild( row )
  })
}

const escapeHtml = function( str ) {
  const div = document.createElement( 'div' )
  div.textContent = str
  return div.innerHTML
}

// -- datacalls --

const loadTodos = async function(){
  const response = await fetch('/api/todos')
  const todos = await response.json()
  render(todos)
}

const addTodo = async function(task, priority){
  const response = await fetch('/api/todos', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({task, priority})
})

  const todos = await response.json()
  render(todos)
}

async function removeTodo( id ) {
  const response = await fetch(`/api/todos/${id}`, { method: 'DELETE'})
  const todos = await response.json()
  render(todos)
}

// -- events--

const onSubmit = async function(event) {
  event.preventDefault()
 
  const taskInput = document.querySelector('#task'),
        prioritySelect = document.querySelector('#priority'),
        status = document.querySelector('#form-status')
 
  const task = taskInput.value.trim()
  if(!task) return
 
  status.textContent = 'Adding...'
 
  await addTodo(task, prioritySelect.value)
 
  taskInput.value = ''
  taskInput.focus()
  status.textContent = 'Added!'
  setTimeout(function() {status.textContent = ''}, 1500)
}

const onTableClick = function( event ) {
  if(!event.target.matches('button[data-id]')) return
  removeTodo(event.target.dataset.id)
}
 
window.onload = function() {
  document.querySelector('#todo-form').addEventListener('submit', onSubmit)
  document.querySelector( '#todo-body' ).addEventListener('click', onTableClick)
  loadTodos()
}