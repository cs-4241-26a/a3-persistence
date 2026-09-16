let editingId = null

const displayWorkouts = function( workouts ) {
  const results = document.querySelector( '#workout-results' ),
        emptyMessage = document.querySelector( '#empty-message' )

  results.innerHTML = ''

  if( workouts.length === 0 ) {
    emptyMessage.classList.remove( 'd-none' )
    return
  } else {
    emptyMessage.classList.add( 'd-none' )
  }

  workouts.forEach( function( workout ) {
    const row = document.createElement( 'tr' ),
          exerciseCell = document.createElement( 'td' ),
          categoryCell = document.createElement( 'td' ),
          setsCell = document.createElement( 'td' ),
          repsCell = document.createElement( 'td' ),
          weightCell = document.createElement( 'td' ),
          volumeCell = document.createElement( 'td' ),
          notesCell = document.createElement( 'td' ),
          actionsCell = document.createElement( 'td' ),
          editButton = document.createElement( 'button' ),
          deleteButton = document.createElement( 'button' )

    exerciseCell.textContent = workout.exercise
    categoryCell.textContent = workout.category || 'Other'
    setsCell.textContent = workout.sets
    repsCell.textContent = workout.reps
    weightCell.textContent = `${ workout.weight } ${ workout.unit || 'lb' }`
    volumeCell.textContent = `${ workout.volume } ${ workout.unit || 'lb' }`
    notesCell.textContent = workout.notes || ''

    editButton.type = 'button'
    editButton.className = 'btn btn-warning btn-sm me-2'
    editButton.textContent = 'Edit'
    editButton.dataset.id = workout.id
    editButton.dataset.exercise = workout.exercise
    editButton.dataset.category = workout.category || 'Other'
    editButton.dataset.sets = workout.sets
    editButton.dataset.reps = workout.reps
    editButton.dataset.weight = workout.weight
    editButton.dataset.unit = workout.unit || 'lb'
    editButton.dataset.notes = workout.notes || ''
    editButton.onclick = editWorkout

    deleteButton.type = 'button'
    deleteButton.className = 'btn btn-danger btn-sm'
    deleteButton.textContent = 'Delete'
    deleteButton.dataset.id = workout.id
    deleteButton.onclick = deleteWorkout

    actionsCell.appendChild( editButton )
    actionsCell.appendChild( deleteButton )

    row.appendChild( exerciseCell )
    row.appendChild( categoryCell )
    row.appendChild( setsCell )
    row.appendChild( repsCell )
    row.appendChild( weightCell )
    row.appendChild( volumeCell )
    row.appendChild( notesCell )
    row.appendChild( actionsCell )

    results.appendChild( row )
  })
}


const getWorkouts = async function() {
  const response = await fetch( '/data' )

  if( response.status === 401 ) {
    window.location.href = '/'
    return
  }

  const workouts = await response.json()
  displayWorkouts( workouts )
}


const submit = async function( event ) {
  event.preventDefault()

  const exercise = document.querySelector( '#exercise' ),
        category = document.querySelector( '#category' ),
        sets = document.querySelector( '#sets' ),
        reps = document.querySelector( '#reps' ),
        weight = document.querySelector( '#weight' ),
        notes = document.querySelector( '#notes' ),
        unit = document.querySelector( 'input[name="unit"]:checked' ),
        json = {
          exercise: exercise.value,
          category: category.value,
          sets: sets.value,
          reps: reps.value,
          weight: weight.value,
          unit: unit.value,
          notes: notes.value
        }

  let url = '/submit'

  if( editingId !== null ) {
    url = '/update'
    json.id = editingId
  }

  const response = await fetch( url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify( json )
  })

  if( response.status === 401 ) {
    window.location.href = '/'
    return
  }

  const workouts = await response.json()

  displayWorkouts( workouts )

  document.querySelector( '#workout-form' ).reset()
  document.querySelector( '#unit-lb' ).checked = true

  editingId = null
  document.querySelector( '#submit-button' ).textContent = 'Add Exercise'
}


const deleteWorkout = async function( event ) {
  const json = {
    id: event.target.dataset.id
  }

  const response = await fetch( '/delete', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify( json )
  })

  if( response.status === 401 ) {
    window.location.href = '/'
    return
  }

  const workouts = await response.json()
  displayWorkouts( workouts )
}


const editWorkout = function( event ) {
  const button = event.target

  editingId = button.dataset.id

  document.querySelector( '#exercise' ).value = button.dataset.exercise
  document.querySelector( '#category' ).value = button.dataset.category
  document.querySelector( '#sets' ).value = button.dataset.sets
  document.querySelector( '#reps' ).value = button.dataset.reps
  document.querySelector( '#weight' ).value = button.dataset.weight
  document.querySelector( '#notes' ).value = button.dataset.notes

  if( button.dataset.unit === 'kg' ) {
    document.querySelector( '#unit-kg' ).checked = true
  } else {
    document.querySelector( '#unit-lb' ).checked = true
  }

  document.querySelector( '#submit-button' ).textContent = 'Update Exercise'

  document.querySelector( '#workout-form' ).scrollIntoView({
    behavior: 'smooth'
  })
}


window.onload = function() {
  document
    .querySelector( '#workout-form' )
    .addEventListener( 'submit', submit )

  getWorkouts()
}