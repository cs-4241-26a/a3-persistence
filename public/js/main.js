// FRONT-END (CLIENT) JAVASCRIPT HERE
const submit = async function( event ) {
  // stop form submission from trying to load
  // a new .html page for displaying results...
  // this was the original browser behavior and still
  // remains to this day
  event.preventDefault()

  const firstName = document.querySelector('#fname').value
  const lastName = ''
  const birthday = document.querySelector('#birthday'). value
  
  const  json = { 
    firstName: firstName, 
    lastName: lastName, 
    birthday: birthday
  }
  const body = JSON.stringify(json)

  const response = await fetch( '/api/zodiac', {
    method:'POST',
    headers: {
      'Content-Type' : 'application/json'
    },
    body: body
  })

  const data = await response.json()
  const result = document.querySelector('#result')
  const person = data

  result.innerHTML = `
  <div style = 'font-size: 50px;'>
  ${person.firstName}, your zodiac sign is
  ${person.zodiacImage} ${person.zodiacSign}!
  </div>
`


}
const signup = async function(event){
  event.preventDefault()
  const userName = document.querySelector('#username').value
  const password = document.querySelector('#password').value

  const json = {
    userName: userName,
    password: password
  }
  const response = await fetch('/api/signup', {
    method: 'POST',
    headers: {
      'Content-Type' : 'application/json'
    },
    body: JSON.stringify(json)
  })
  const data = await response.json()

  if (data.message){
    window.location.href='/Firstpage.html'
  }
  }

const login = async function(event){
  event.preventDefault()
  const userName = document.querySelector('#loginusername').value
  const password = document.querySelector('#loginpassword').value

  const json = {
    userName: userName, 
    lastName: '',
    password: password
  }
   const response = await fetch('/api/login', {
    method: 'POST',
    headers: {
      'Content-Type' : 'application/json'
    },
    body: JSON.stringify(json)
  })
  const data = await response.json()

  if (data.message){
    window.location.href='/Firstpage.html'
  }
  }
 const getZodiacRecords = async function(){
  const response = await fetch('/api/zodiac')
  const records = await response.json()

  const savedRecords = document.querySelector('#savedRecords')

  savedRecords.innerHTML = ''

  records.forEach(function(person){

    savedRecords.innerHTML += `
      <div>
        <p><strong>Name:</strong> ${person.firstName}</p>
        <p><strong>Birthday:</strong> ${person.birthday}</p>
        <p><strong>Zodiac Sign:</strong> ${person.zodiacImage} ${person.zodiacSign}</p>
        <button onclick="editRecord('${person._id}')">Edit</button>
         <button onclick="deleteRecord('${person._id}')">Delete</button>
        <hr>
      </div>
    `
  })
}

const editRecord= async function(id){
  const newBirthday = prompt ("Enter a new birday: ")

  if(!newBirthday){
    return
  }
   const response = await fetch('/api/zodiac/' + id, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      birthday: newBirthday
    })
  })
   const data = await response.json()

  console.log("Updated record:", data)

  getZodiacRecords()
}


const deleteRecord= async function(id){
  const response = await fetch('/api/zodiac/'+ id, { 
    method: 'DELETE'
   })

   const data = await response.json()
   console.log("Delete your record:", data)
   getZodiacRecords()
}
 

window.onload = function() {

  const form = document.querySelector('#zodiacForm')
  if(form){
    form.onsubmit = submit
  }


  const signupForm = document.querySelector('#signupForm')
  if (signupForm){
  signupForm.onsubmit = signup
  }

  const loginForm = document.querySelector('#loginForm')
  if (loginForm){
    loginForm.onsubmit = login
  }
  if (document.querySelector('#SavedRecord')){
  getZodiacRecords()
  }

}
