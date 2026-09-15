// FRONT-END (CLIENT) JAVASCRIPT HERE

const submit = async function( event ) {
  // stop form submission from trying to load
  // a new .html page for displaying results...
  // this was the original browser behavior and still
  // remains to this day
  event.preventDefault()
  
  const json = { user: document.querySelector('#user').value,  
    pass: document.querySelector('#pass').value}
  const body = JSON.stringify( json )

  const response = await fetch( '/sign', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify( json )
  })

  let arr = await response.text()
  
  arr = JSON.parse(arr)

  if (arr.accepted) {
    console.log("yay")
    window.location.replace("letsjustrsay.html");
  }
}

window.onload = function() {
  const button = document.querySelector('button')
  button.onclick = submit
}
