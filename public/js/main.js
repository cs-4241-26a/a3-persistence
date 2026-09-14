// FRONT-END (CLIENT) JAVASCRIPT HERE

const loadExpenses = async function() {
  const response = await fetch( '/expenses' )
  const expenses = await response.json()
  renderTable( expenses )
}

const renderTable = function( expenses ) {
  const tbody = document.querySelector( '#results-body' )
  tbody.innerHTML = ''

  expenses.forEach( function( expense ) {
    const row = document.createElement( 'tr' )
    row.innerHTML = `
      <td>${expense.description}</td>
      <td>${expense.category}</td>
      <td>$${expense.amount.toFixed(2)}</td>
      <td>${expense.spendLevel}</td>
      <td>
        <button class="edit-btn" data-id="${expense._id}">Edit</button>
        <button class="delete-btn" data-id="${expense._id}">Delete</button>
      </td>
    `
    tbody.appendChild( row )
  })

  document.querySelectorAll( '.delete-btn' ).forEach( function( btn ) {
    btn.onclick = deleteExpense
  })

  document.querySelectorAll( '.edit-btn' ).forEach( function( btn ) {
    btn.onclick = startEdit
  })
}

const startEdit = function( event ) {
  const id = event.target.dataset.id
  const row = event.target.closest( 'tr' )
  const cells = row.querySelectorAll( 'td' )

  const description = cells[0].textContent
  const category = cells[1].textContent
  const amount = cells[2].textContent.replace( '$', '' )

  row.innerHTML = `
    <td><input type="text" class="edit-description" value="${description}"></td>
    <td><input type="text" class="edit-category" value="${category}"></td>
    <td><input type="number" step="0.01" class="edit-amount" value="${amount}"></td>
    <td colspan="2">
      <button class="save-btn" data-id="${id}">Save</button>
    </td>
  `

  row.querySelector( '.save-btn' ).onclick = saveEdit
}

const saveEdit = async function( event ) {
  const id = event.target.dataset.id
  const row = event.target.closest( 'tr' )

  const description = row.querySelector( '.edit-description' ).value
  const category = row.querySelector( '.edit-category' ).value
  const amount = row.querySelector( '.edit-amount' ).value

  const json = { id, description, category, amount },
        body = JSON.stringify( json )

  const response = await fetch( '/edit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body
  })

  const expenses = await response.json()
  renderTable( expenses )
}

const addExpense = async function( event ) {
  event.preventDefault()

  const description = document.querySelector( '#description' ).value,
        category = document.querySelector( '#category' ).value,
        amount = document.querySelector( '#amount' ).value,
        json = { description, category, amount },
        body = JSON.stringify( json )

  const response = await fetch( '/add', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body
  })

  const expenses = await response.json()
  renderTable( expenses )

  document.querySelector( '#expense-form' ).reset()
}

const deleteExpense = async function( event ) {
  const id = event.target.dataset.id,
        json = { id },
        body = JSON.stringify( json )

  const response = await fetch( '/delete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body
  })

  const expenses = await response.json()
  renderTable( expenses )
}

const logout = async function() {
  await fetch( '/logout', { method: 'POST' })
  window.location.href = '/'
}

window.onload = function() {
  document.querySelector( '#expense-form' ).onsubmit = addExpense
  document.querySelector( '#logout-btn' ).onclick = logout
  loadExpenses()
}
