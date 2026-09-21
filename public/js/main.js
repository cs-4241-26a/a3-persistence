// FRONT-END (CLIENT) JAVASCRIPT HERE
const loadApplication = async function(){
  const response = await fetch('/api/applications')
  const applications = await response.json()
  console.log(applications) 

  displayApplications(applications)
  
}





const deleteApplication = async function(id) {
  const response = await fetch('/api/applications', {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ id })
  })

  const applications = await response.json()
  displayApplications(applications)
  document.querySelector('#application-message').textContent = 'Application deleted successfully!'
}

const updateApplication = async function(id, updatedData) {
  const response = await fetch('/api/applications', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
       id,
      status: updatedData.status
    })
  })

  const applications = await response.json()
  displayApplications(applications)

  document.querySelector('#application-message').textContent = 'Application updated successfully!'

  
}

const displayApplications = function(applications) {

  const table=document.querySelector('#result-table')
  const tbody=document.querySelector('#result-body')
  const noMessage=document.querySelector('#no-result')

  tbody.replaceChildren() //had to do some research on how to use this since I wasn't aware of this function for getting ready of previous responses to display every time the main display function runs.

  if (applications.length === 0) {
    table.hidden = true
    noMessage.hidden = false
    return
  }

  table.hidden=false
  noMessage.hidden=true

  applications.forEach(function(app) {
    const row = document.createElement('tr')
    row.innerHTML = `
      <td>${app.company}</td>
      <td>${app.role}</td>
      <td>${app.dateApplied}</td>
      <td>${app.resume}</td>
      <td>${app.applicationAge}</td>

    `

    const statusCell = document.createElement('td')
    const statusSelect = document.createElement('select')

    statusSelect.className = 'form-select'

    statusSelect.setAttribute('aria-label', `Status for ${app.company}`)

    const allStatus = [
      'applied',
      'interview',
      'offer',
      'rejected',
      'withdraw'

    ]

    allStatus.forEach(function(status) {
      const option = document.createElement('option')
      option.value = status
      option.textContent = status
      if (app.status === status) {
        option.selected = true
      }
      statusSelect.appendChild(option)
    })

    statusCell.appendChild(statusSelect)
    row.insertBefore(statusCell, row.children[4])

    const deleteCell = document.createElement('td')
    const deleteButton = document.createElement('button')
    deleteButton.type = 'button'
    deleteButton.textContent = 'Delete'

    const updateButton = document.createElement('button')
    updateButton.type = 'button'
    updateButton.textContent = 'Update'



    updateButton.addEventListener('click', function() {
      updateApplication(app._id, { status: statusSelect.value })
    })

    deleteButton.className = 'btn btn-danger btn-sm delete-button'
    updateButton.className = 'btn btn-success btn-sm update-button'

    deleteButton.addEventListener('click', () => {
      deleteApplication(app._id)
    })
    
    updateButton.setAttribute(
      'aria-label',
      `Update application for ${app.company}`
    )
    deleteButton.setAttribute(
      'aria-label',
      `Delete application for ${app.company}`
    )

    deleteCell.appendChild(updateButton)
    deleteCell.appendChild(deleteButton)
    row.appendChild(deleteCell)
    tbody.appendChild(row)
    
  })
}


const submit = async function( event ) {
  // stop form submission from trying to load
  // a new .html page for displaying results...
  // this was the original browser behavior and still
  // remains to this day
  event.preventDefault()

  const application = {
    company: document.querySelector('#company').value,
    role: document.querySelector('#role').value,
    dateApplied: document.querySelector('#date-applied').value,
    resume: document.querySelector('#resume').value,
    status: document.querySelector('#status').value
  }



  const body = JSON.stringify(application)

  const response = await fetch( '/api/applications', {
    method:'POST',
    headers:{
      'Content-Type':'application/json'
    },
    body 

  })

  const data = await response.json()
  displayApplications(data)

  document.querySelector('#application-message').textContent = 'Application added successfully!'

  console.log( 'Server response:', data )
}

const loginTracker = function(username){
  document.querySelector('#login-section').hidden = true
  document.querySelector('#tracker').hidden = false
  document.querySelector('#current-user').textContent = username
}

const showLogin= function(){

  document.querySelector('#login-section').hidden = false
  document.querySelector('#tracker').hidden = true
}

const login = async function(event){
  event.preventDefault()
  const username = document.querySelector('#username').value
  const response  = await fetch('/api/login', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ username })
  })

  const data = await response.json()
  loginTracker(data.username)
  loadApplication()
}

const logout = async function(event){
  await fetch('/api/logout', {
    method: 'POST'
  })
  document.querySelector('#username').value = ''
  document.querySelector('#login-message').textContent = ''
  showLogin()
}

const checkSession = async function() {
  const response = await fetch('/api/session')
  const data = await response.json()

  if (data.loggedIn) {
    loginTracker(data.username)
    loadApplication()
  } else {
    showLogin()
  } 
}




window.onload = function() {
  document.querySelector('#login-form').onsubmit = login
  document.querySelector('#application-form').onsubmit = submit
  document.querySelector('#logout-button').onclick = logout


  checkSession()
}



