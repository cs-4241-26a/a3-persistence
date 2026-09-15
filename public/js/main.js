// FRONT-END (CLIENT) JAVASCRIPT HERE

let ul

const submit = async function( event ) {
  // stop form submission from trying to load
  // a new .html page for displaying results...
  // this was the original browser behavior and still
  // remains to this day
  event.preventDefault()
  
  const json = { name: document.querySelector('#itemname').value,  
    price: document.querySelector('#itemprice').value, 
    tasty: document.querySelector('#itemgood').value, 
    delete: document.querySelector('#delete').value, 
    modify: document.querySelector('#modify').value}
  const body = JSON.stringify( json )

  let type = '/add'
  if (document.querySelector('#delete').value) {
    type = '/remove'
  }
  if (document.querySelector('#modify').value) {
    type = '/update'
  }

  fetch( type, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify( json )
  })

  const response = await fetch( '/docs', {
    method:  'GET',
    headers: { 'Content-Type': 'application/json' },
  })

  let arr = await response.text()

  console.log(arr)
  
  arr = JSON.parse(arr)

  console.log(arr)

  ul.innerHTML = ''
  for (let item of arr) {
    const li = document.createElement('li')
    li.innerText = "Name: " + item.name + " Price: $" + item.price + " Tasty?: " + item.tasty
    ul.appendChild(li)
  }
}

window.onload = function() {
  const button = document.querySelector('button')
  button.onclick = submit
  ul = document.createElement('ul')
  document.getElementById("forma").appendChild(ul)
}
