// FRONT-END (CLIENT) JAVASCRIPT HERE
let ul = null

const createList = function ( data ) {
  ul.innerHTML = ''
  data.forEach( (item, index) => {

    const li = document.createElement( 'li' )
    li.innerText = `Model: ${item.model}, Year: ${item.year}, Color: ${item.color}, MPG: ${item.mpg}, `
    
    const price = document.createElement('span')
    price.className = 'price'
    price.textContent = `Our Price: $${item.price}`

    const deleteButton = document.createElement( 'button' )
    deleteButton.innerText = "Delete"
    deleteButton.className = "delete-button"
    deleteButton.onclick = () => deleteCar(index)
    
    li.appendChild( price )
    li.appendChild( deleteButton )
    ul.appendChild( li )
  })
}

const submit = async function( event ) {
  // stop form submission from trying to load
  // a new .html page for displaying results...
  // this was the original browser behavior and still
  // remains to this day
  event.preventDefault()
  
  const model = document.querySelector( '#model' ),
        year = document.querySelector( '#year' ),
        color = document.querySelector( '#color' ),
        json = { 
          model: model.value,
          year: year.value,
          color: color.value
        },
        body = JSON.stringify( json )

  const response = await fetch( '/submit', {
    method:'POST',
    headers: { 'Content-Type': 'application/json' },
    body 
  })

  if ( response.ok ) {
    const data = await response.json()
    createList( data )
  }
}

const deleteCar = async function ( index ) {
  const response = await fetch( '/delete', {
    method:'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify( { index } )
  })

  if ( response.ok ) {
    const data = await response.json()
    createList( data )
  }
}

window.onload = function() {
  const button = document.querySelector('button')
  button.onclick = submit
  ul = document.createElement( 'ul' )
  document.body.appendChild( ul )

  fetch( '/data' )
    .then( response  => response.json() )
    .then( data => { createList( data ) })
}
