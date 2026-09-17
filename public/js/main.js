// FRONT-END (CLIENT) JAVASCRIPT HERE
let ul = null
let editingID = null

const render = function(arr){
  ul.innerHTML = ''
  for (const [index, item] of arr.entries()) {
    const li = document.createElement('li')
    li.classList.add('list-group-item', 'd-flex', 'align-items-center')


    const deleteButton = document.createElement('button')
    deleteButton.type = 'button'
    deleteButton.style.marginRight = '20px'
        deleteButton.style.marginLeft = '20px'

    deleteButton.innerText = 'Delete'
    deleteButton.onclick = function(){
        deleteEntry(item._id)
    }
    
    const editButton = document.createElement('button')
    editButton.type = 'button'
    editButton.innerText = 'edit'
    editButton.onclick = function(){
        editEntry(item)
    }

    deleteButton.classList.add('btn', 'btn-danger', 'btn-sm')
    editButton.classList.add('btn', 'btn-secondary', 'btn-sm')
    li.innerHTML = `<span class = "exercise-name">${item.exercise}</span> - ${item.sets} x ${item.reps}: Total reps ${item.total_reps}, Total calories Burned: <span class = "calories-burned">${item.calories_burned}</span> `
    li.appendChild(deleteButton)
    li.appendChild(editButton)
    ul.appendChild(li)
}}
const submit = async function( event ) {
  // stop form submission from trying to load
  // a new .html page for displaying results...
  // this was the original browser behavior and still
  // remains to this day
  event.preventDefault()
  
  const exercise = document.querySelector( '#exercise' ),
        sets = document.querySelector( '#sets' ),
        reps = document.querySelector( '#reps' ),
        json = { exercise: exercise.value, sets: Number(sets.value), reps: Number(reps.value) },
        body = JSON.stringify( json )


  let response
  if (editingID != null){
    json._id = editingID
    response = await fetch( '/update', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify( json )
  })
  editingID = null
  }else{
    response = await fetch( '/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify( json )
  })
  }
  const arr = await response.json()
  render(arr)
}


const deleteEntry = async function(index){
  const response = await fetch( '/delete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify( {_id: index} )
  })
  const arr = await response.json()
  render(arr)
}

const editEntry = function(item){
  document.querySelector('#exercise').value = item.exercise
  document.querySelector('#sets').value = item.sets
  document.querySelector('#reps').value = item.reps
  editingID = item._id
}

window.onload = async function() {
  const button = document.querySelector('button')
  button.onclick = submit
  ul = document.createElement('ul')
  ul.classList.add('list-group', 'mt-4')
  document.body.appendChild(ul)
  
  const response = await fetch('/docs')
  const arr = await response.json()
  render(arr)
}

