const loadList = async function() {
  const response = await fetch('/data')
  const appdata   = await response.json()

  const tbody = document.querySelector('#list-body')
  tbody.innerHTML = ''

  appdata.forEach(function(item) {
    const row = document.createElement('tr')
    row.dataset.id = item._id

    row.innerHTML = `
      <td class="cell-task">${item.task}</td>
      <td class="cell-category">${item.category}</td>
      <td class="cell-created">${item.creationDate}</td>
      <td class="cell-deadline">${item.deadline}</td>
      <td class="cell-priority">${item.priority}</td>
      <td>
        <button class="btn btn-primary edit-btn">Edit</button>
        <button class="btn btn-danger delete-btn">Delete</button>
      </td>
    `
    tbody.appendChild(row)
  })

  tbody.querySelectorAll('.delete-btn').forEach(function(button) {
    button.onclick = async function() {
      const id = button.closest('tr').dataset.id

      await fetch('/data', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({id})
      })

      loadList()
    }
  })

  tbody.querySelectorAll('.edit-btn').forEach(function(button) {
    button.onclick = function() {
      startEdit(button.closest('tr'))
    }
  })
}

const startEdit = function(row) {
  const task     = row.querySelector('.cell-task').textContent
  const category = row.querySelector('.cell-category').textContent
  const created  = row.querySelector('.cell-created').textContent
  const deadline = row.querySelector('.cell-deadline').textContent

  row.innerHTML = `
    <td><input type="text" class="edit-task" value="${task}"></td>
    <td><input type="text" class="edit-category" value="${category}"></td>
  <td><input type="datetime-local" class="edit-created" value="${created}"></td>
    <td><input type="datetime-local" class="edit-deadline" value="${deadline}"></td>
    <td>—</td>
    <td><button class="save-btn">Save</button></td>
  `

  row.querySelector('.save-btn').onclick = async function() {
    const id = row.dataset.id

    await fetch('/data', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id,
        task: row.querySelector('.edit-task').value,
        category: row.querySelector('.edit-category').value,
        creationDate: row.querySelector('.edit-created').value,
        deadline: row.querySelector('.edit-deadline').value
      })
    })

    loadList()
  }
}

window.onload = loadList