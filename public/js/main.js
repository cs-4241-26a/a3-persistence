// FRONT-END (CLIENT) JAVASCRIPT
'use strict'

let currentData = []

const formTitle   = document.querySelector( '#form-title' )
const form        = document.querySelector( '#car-form' )
const submitBtn   = document.querySelector( '#submit-btn' )
const cancelBtn   = document.querySelector( '#cancel-btn' )
const editIdInput = document.querySelector( '#edit-id' )
const tbody       = document.querySelector( '#inventory-body' )
const emptyMsg    = document.querySelector( '#empty-msg' )
const navUser     = document.querySelector( '#nav-user' )
const logoutBtn   = document.querySelector( '#logout-btn' )

// ── Helpers ───────────────────────────────────────────────

const postJSON = async ( url, body ) => {
  const res = await fetch( url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify( body )
  })
  return res.json()
}

const resetForm = () => {
  form.reset()
  editIdInput.value = ''
  formTitle.textContent = 'Add a Car'
  submitBtn.textContent = 'Add Car'
  cancelBtn.classList.add( 'd-none' )
  document.querySelector( '#trans-auto' ).checked = true
}

const valueBadge = ( rating ) => {
  const colours = {
    'Great Deal': 'success',
    'Good Value': 'primary',
    'Fair Price': 'warning text-dark',
    'Premium':    'secondary'
  }
  return `<span class="badge bg-${colours[ rating ] || 'secondary'}">${rating}</span>`
}

// ── Table Renderer ────────────────────────────────────────

const renderTable = ( data ) => {
  tbody.innerHTML = ''

  if ( data.length === 0 ) {
    emptyMsg.classList.remove( 'd-none' )
    return
  }
  emptyMsg.classList.add( 'd-none' )

  data.forEach( car => {
    const tr = document.createElement( 'tr' )
    tr.innerHTML =
      `<td>${car.make}</td>` +
      `<td>${car.model}</td>` +
      `<td>${car.year}</td>` +
      `<td>$${car.price.toLocaleString()}</td>` +
      `<td>${car.mpg}</td>` +
      `<td>${car.transmission || 'Automatic'}</td>` +
      `<td>${car.certified ? '<span class="badge bg-info text-dark">CPO</span>' : ''}</td>` +
      `<td>${valueBadge( car.valueRating )}</td>` +
      `<td class="text-muted small">${car.notes || ''}</td>` +
      `<td class="text-nowrap">` +
        `<button class="btn btn-outline-primary btn-sm me-1 edit-btn" data-id="${car.id}">Edit</button>` +
        `<button class="btn btn-outline-danger btn-sm delete-btn" data-id="${car.id}">Delete</button>` +
      `</td>`
    tbody.appendChild( tr )
  })

  tbody.querySelectorAll( '.edit-btn' ).forEach( btn => {
    btn.addEventListener( 'click', () => {
      const car = currentData.find( c => c.id === parseInt( btn.dataset.id ) )
      if ( !car ) return

      editIdInput.value = car.id
      document.querySelector( '#make' ).value   = car.make
      document.querySelector( '#model' ).value  = car.model
      document.querySelector( '#year' ).value   = car.year
      document.querySelector( '#price' ).value  = car.price
      document.querySelector( '#mpg' ).value    = car.mpg
      document.querySelector( '#notes' ).value  = car.notes || ''
      document.querySelector( '#certified' ).checked = car.certified || false

      const trans = car.transmission || 'Automatic'
      document.querySelectorAll( 'input[name="transmission"]' ).forEach( r => {
        r.checked = ( r.value === trans )
      })

      formTitle.textContent = 'Edit Car'
      submitBtn.textContent = 'Update Car'
      cancelBtn.classList.remove( 'd-none' )
      document.querySelector( '#form-title' ).scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  })

  tbody.querySelectorAll( '.delete-btn' ).forEach( btn => {
    btn.addEventListener( 'click', async () => {
      if ( !confirm( 'Delete this car?' ) ) return
      const data = await postJSON( '/delete', { id: parseInt( btn.dataset.id ) } )
      currentData = data
      renderTable( data )
    })
  })
}

// ── Form Submit ───────────────────────────────────────────

form.addEventListener( 'submit', async ( e ) => {
  e.preventDefault()

  const body = {
    make:         document.querySelector( '#make' ).value.trim(),
    model:        document.querySelector( '#model' ).value.trim(),
    year:         document.querySelector( '#year' ).value,
    price:        document.querySelector( '#price' ).value,
    mpg:          document.querySelector( '#mpg' ).value,
    transmission: document.querySelector( 'input[name="transmission"]:checked' ).value,
    certified:    String( document.querySelector( '#certified' ).checked ),
    notes:        document.querySelector( '#notes' ).value.trim()
  }

  const isEditing = editIdInput.value !== ''
  if ( isEditing ) body.id = editIdInput.value

  const data = await postJSON( isEditing ? '/update' : '/submit', body )
  currentData = data
  renderTable( data )
  resetForm()
})

cancelBtn.addEventListener( 'click', resetForm )

// ── Logout ────────────────────────────────────────────────

logoutBtn.addEventListener( 'click', async () => {
  await fetch( '/logout', { method: 'POST' } )
  window.location.href = '/login.html'
})

// ── Initial Load ──────────────────────────────────────────

window.onload = async () => {
  const sessionRes = await fetch( '/session' )
  if ( sessionRes.status === 401 ) {
    window.location.href = '/login.html'
    return
  }
  const { username } = await sessionRes.json()
  navUser.textContent = `Signed in as ${username}`

  const dataRes = await fetch( '/data' )
  if ( dataRes.status === 401 ) {
    window.location.href = '/login.html'
    return
  }
  currentData = await dataRes.json()
  renderTable( currentData )
}
