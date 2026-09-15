let editingID = null

const renderTodos = function (todos) {
    const todobody = document.querySelector('#todo-body')
    const status = document.querySelector('#todo-status')

    todobody.innerHTML = ''

    todos.forEach(function (todo) {
        const row = document.createElement('tr')

        const deadlineDate = new Date(todo.deadline).toLocaleDateString()
        const createdDate = new Date(todo.created).toLocaleDateString()

        if (todo._id === editingID) {
            row.innerHTML = `
                <td>
                    <label for="edit-task-${todo._id}" class="visually-hidden">
                        Edit task
                    </label>
                    <input
                        type="text"
                        id="edit-task-${todo._id}"
                        class="edit-task form-control form-control-sm"
                        value="${todo.task}"
                        required
                    >
                </td>

                <td>
                    <label for="edit-priority-${todo._id}" class="visually-hidden">
                        Edit priority
                    </label>

                    <select
                        id="edit-priority-${todo._id}"
                        class="edit-priority form-select form-select-sm"
                    >
                        <option value="low" ${todo.priority === 'low' ? 'selected' : ''}>
                            Low
                        </option>

                        <option value="medium" ${todo.priority === 'medium' ? 'selected' : ''}>
                            Medium
                        </option>

                        <option value="high" ${todo.priority === 'high' ? 'selected' : ''}>
                            High
                        </option>
                    </select>
                </td>

                <td>${createdDate}</td>
                <td>${deadlineDate}</td>

                <td>
                    <button
                        type="button"
                        class="save-btn btn btn-sm btn-success me-1"
                        data-id="${todo._id}"
                        data-created="${todo.created}"
                        aria-label="Save changes to ${todo.task}"
                    >
                        Save
                    </button>

                    <button
                        type="button"
                        class="cancel-btn btn btn-sm btn-secondary"
                        aria-label="Cancel editing ${todo.task}"
                    >
                        Cancel
                    </button>
                </td>
            `
        }
        else {
            row.innerHTML = `
                <td>${todo.task}</td>

                <td class="priority-${todo.priority}">
                    ${todo.priority}
                </td>

                <td>${createdDate}</td>

                <td>${deadlineDate}</td>

                <td>
                    <button
                        type="button"
                        class="edit-btn btn btn-sm btn-outline-primary me-1"
                        data-id="${todo._id}"
                        aria-label="Edit ${todo.task}"
                    >
                        Edit
                    </button>

                    <button
                        type="button"
                        class="delete-btn btn btn-sm btn-outline-danger"
                        data-id="${todo._id}"
                        aria-label="Delete ${todo.task}"
                    >
                        Delete
                    </button>
                </td>
            `
        }

        todobody.appendChild(row)
    })

    document.querySelectorAll('.edit-btn').forEach(function (btn) {
        btn.onclick = () => {
            editingID = btn.dataset.id
            loadTodos()
        }
    })

    document.querySelectorAll('.cancel-btn').forEach(function (btn) {
        btn.onclick = () => {
            editingID = null
            loadTodos()
        }
    })

    document.querySelectorAll('.delete-btn').forEach(function (btn) {
        btn.onclick = () => deleteTodo(btn.dataset.id)
    })

    document.querySelectorAll('.save-btn').forEach(function (btn) {
        btn.onclick = () => saveTodo(btn.dataset.id, btn.dataset.created)
    })

    status.textContent = `${todos.length} task${todos.length === 1 ? '' : 's'} displayed.`
}


const loadTodos = async function () {
    try {
        const response = await fetch('/api/todos')

        if (!response.ok) {
            throw new Error('Unable to load tasks')
        }

        const todos = await response.json()

        renderTodos(todos)
    }
    catch (error) {
        document.querySelector('#todo-status').textContent =
            'Unable to load tasks. Please try again.'
    }
}


const addTodo = async function (event) {
    event.preventDefault()

    const task = document.querySelector('#task').value
    const priority = document.querySelector('#priority').value

    const response = await fetch('/add', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            task,
            priority
        })
    })

    if (!response.ok) {
        return
    }

    const updatedTodos = await response.json()

    renderTodos(updatedTodos)

    document.querySelector('#task').value = ''
    document.querySelector('#task').focus()
}


const deleteTodo = async function (id) {
    const response = await fetch('/delete', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            id
        })
    })

    if (!response.ok) {
        return
    }

    const updatedTodos = await response.json()

    renderTodos(updatedTodos)
}


const saveTodo = async function (id, created) {
    const task = document.querySelector('.edit-task').value
    const priority = document.querySelector('.edit-priority').value

    const response = await fetch('/update', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            id,
            task,
            priority,
            created
        })
    })

    if (!response.ok) {
        return
    }

    const updatedTodos = await response.json()

    editingID = null

    renderTodos(updatedTodos)
}


window.onload = function () {
    document.querySelector('#todo-form').onsubmit = addTodo
    loadTodos()
}