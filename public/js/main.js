let currentTodos = []
let editingTodoId = null
const elements = {}

function showLogin(message = '') {
  elements.loginSection.hidden = false
  elements.todoInterface.hidden = true
  elements.logoutButton.hidden = true
  elements.loginMessage.textContent = message
}
function showTodos() {
  elements.loginSection.hidden = true
  elements.todoInterface.hidden = false
  elements.logoutButton.hidden = false
}
function resetTodoForm() {
  editingTodoId = null
  elements.todoForm.reset()
  elements.creationDate.value = new Date().toISOString().slice(0, 10)
  elements.submitButton.textContent = 'Add todo'
  elements.cancelEditButton.hidden = true
  elements.formHeading.textContent = 'Add a todo'
}
function addCell(row, value, label) {
  const cell = document.createElement('td')
  cell.textContent = value
  cell.dataset.label = label
  row.appendChild(cell)
}
function renderTodos(todos) {
  currentTodos = todos
  elements.results.replaceChildren()
  elements.emptyMessage.hidden = todos.length > 0
  elements.todoTable.hidden = todos.length === 0
  elements.todoCount.textContent = `${todos.length} ${todos.length === 1 ? 'task' : 'tasks'}`
  todos.forEach(function (todo) {
    const row = document.createElement('tr')
    addCell(row, todo.task, 'Task')
    const priorityCell = document.createElement('td')
    priorityCell.dataset.label = 'Priority'
    const priorityBadge = document.createElement('span')
    priorityBadge.className = `priority-badge priority-${todo.priority}`
    priorityBadge.textContent = todo.priority
    priorityCell.appendChild(priorityBadge)
    row.appendChild(priorityCell)
    addCell(row, todo.creationDate, 'Start'); addCell(row, todo.deadline, 'Deadline')
    const actions = document.createElement('td'); actions.className = 'row-actions'; actions.dataset.label = 'Actions'
    for (const [label, className] of [['Edit', 'edit-button'], ['Delete', 'delete-button']]) {
      const button = document.createElement('button'); button.type = 'button'; button.className = className
      button.dataset.id = todo._id; button.textContent = label; button.setAttribute('aria-label', `${label} ${todo.task}`); actions.appendChild(button)
    }
    row.appendChild(actions); elements.results.appendChild(row)
  })
}
async function getTodos() {
  const response = await fetch('/api/todos')
  if (response.status === 401) return showLogin()
  const data = await response.json()
  if (!response.ok) throw new Error(data.error || 'Could not load todos')
  renderTodos(data); showTodos()
}
async function login(event) {
  event.preventDefault(); elements.loginMessage.textContent = ''
  try {
    const response = await fetch('/api/login', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ username: elements.username.value.trim(), password: elements.password.value }) })
    const data = await response.json()
    if (!response.ok) throw new Error(data.error || 'Login failed')
    elements.loginForm.reset(); await getTodos()
  } catch (error) { elements.loginMessage.textContent = error.message }
}
async function submitTodo(event) {
  event.preventDefault()
  const todo = { task: elements.task.value.trim(), priority: elements.priority.value, creationDate: elements.creationDate.value }
  try {
    const wasEditing = Boolean(editingTodoId)
    const response = await fetch(wasEditing ? `/api/todos/${editingTodoId}` : '/api/todos', { method: wasEditing ? 'PUT' : 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(todo) })
    const data = await response.json()
    if (!response.ok) throw new Error(data.error || 'Could not save todo')
    renderTodos(data); resetTodoForm()
    elements.formMessage.textContent = wasEditing ? 'Todo updated successfully.' : 'Todo added successfully.'
  } catch (error) { elements.formMessage.textContent = error.message }
}
function editTodo(id) {
  const todo = currentTodos.find(item => item._id === id)
  if (!todo) return
  editingTodoId = id; elements.task.value = todo.task; elements.priority.value = todo.priority; elements.creationDate.value = todo.creationDate
  elements.submitButton.textContent = 'Save changes'; elements.cancelEditButton.hidden = false; elements.formHeading.textContent = 'Edit todo'
  elements.formMessage.textContent = 'Editing selected todo.'; elements.task.focus()
}
async function deleteTodo(id) {
  try {
    const response = await fetch(`/api/todos/${id}`, {method: 'DELETE'}); const data = await response.json()
    if (!response.ok) throw new Error(data.error || 'Could not delete todo')
    renderTodos(data); if (editingTodoId === id) resetTodoForm(); elements.formMessage.textContent = 'Todo deleted successfully.'
  } catch (error) { elements.formMessage.textContent = error.message }
}
async function logout() {
  await fetch('/api/logout', {method: 'POST'}); currentTodos = []; renderTodos([]); resetTodoForm(); showLogin('You have been logged out.')
}
window.addEventListener('DOMContentLoaded', function () {
  const ids = ['login-section','login-form','login-message','todo-interface','logout-button','todo-form','task','priority','creation-date','submit-button','cancel-edit-button','form-message','todo-results','empty-message','todo-table','form-heading','username','password','todo-count']
  const names = ['loginSection','loginForm','loginMessage','todoInterface','logoutButton','todoForm','task','priority','creationDate','submitButton','cancelEditButton','formMessage','results','emptyMessage','todoTable','formHeading','username','password','todoCount']
  ids.forEach((id, index) => { elements[names[index]] = document.querySelector(`#${id}`) })
  resetTodoForm()
  if (new URLSearchParams(window.location.search).get('oauth') === 'failed') {
    elements.loginMessage.textContent = 'GitHub login failed. Please try again.'
    window.history.replaceState({}, '', '/')
  }
  elements.loginForm.addEventListener('submit', login); elements.todoForm.addEventListener('submit', submitTodo); elements.logoutButton.addEventListener('click', logout)
  elements.cancelEditButton.addEventListener('click', function () { resetTodoForm(); elements.formMessage.textContent = '' })
  elements.results.addEventListener('click', function (event) { const id = event.target.dataset.id; if (event.target.classList.contains('edit-button')) editTodo(id); if (event.target.classList.contains('delete-button')) deleteTodo(id) })
  getTodos().catch(error => showLogin(error.message))
})
