// FRONT-END (CLIENT) JAVASCRIPT HERE

let currentUser = null
let editingId = null
let editingEntry = null

//The server will return only entries belonging to that username.
const login = async function(event) {
  event.preventDefault()

  const username = document.getElementById("usernameInput").value.trim();
  const password = document.getElementById("passwordInput").value;

  if (!username || !password) {
    document.querySelector('#loginStatus').textContent = 'Please enter a username and password.'
    return
  }

  try {
    const response = await fetch('/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        user: username,
        password: password
      })
    })

    const data = await response.json()
    if (!response.ok) {
      document.querySelector('#loginStatus').textContent =data.error || 'Unable to log in.'
      return
    }

    currentUser = data.user

    document.querySelector('#loginStatus').textContent = 'Logged in as ' + currentUser
    document.querySelector('#currentUser').textContent = currentUser
    updateTable(data.entries)
    updateSummary(data.entries)

    document.getElementById("passwordInput").value = "";

  } catch (error) {
    console.error('Login error:', error)

    document.querySelector('#loginStatus').textContent = 'Unable to connect to the server.'
  }
}


//The server clears the loggedin user and returns all attendance entries.
const logout = async function() {
  try {
    const response = await fetch('/logout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({})
    })

    const data = await response.json()

    if (!response.ok) {
      document.querySelector('#loginStatus').textContent = data.error || 'Unable to log out.'
      return
    }

    currentUser = null

    document.querySelector('#usernameInput').value = ''
    document.querySelector('#currentUser').textContent = 'Logged Out'

    document.querySelector('#loginStatus').textContent = 'No user logged in'

    updateTable(data.entries)
    updateSummary(data.entries)

    document.getElementById("passwordInput").value = "";
    document.querySelector('#tableStatus').textContent = ''

  } catch (error) {
    console.error('Logout error:', error)

    document.querySelector('#loginStatus').textContent = 'Unable to connect to the server.'
  }
}


//Submit a clock-in or clock-out event.
const submitTime = async function(event, clockIn) {
  event.preventDefault()

  if (currentUser === null) {
    document.querySelector('#timeStatus').textContent = 'Please log in before entering time.'
    return
  }

  document.querySelector('#tableStatus').textContent = ''
  const dateInput = document.querySelector('#dateInput')
  const timeInput = document.querySelector('#timeInput')

  const date = dateInput.value.trim()
  const time = timeInput.value.trim()

  if (date === '' || time === '') {
    document.querySelector('#timeStatus').textContent = 'Please enter both a date and time.'
    return
  }

  try {
    const response = await fetch('/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        date: date,
        time: time,
        clockIn: clockIn
      })
    })

    const data = await response.json()

    if (!response.ok) {
      document.querySelector('#timeStatus').textContent = data.error || 'Unable to submit time.'
      return
    }

    const action = clockIn ? 'Clock in' : 'Clock out'

    document.querySelector('#timeStatus').textContent = action + ' recorded for ' + currentUser + '.'

    // The server returns the updated entries for this user.
    updateTable(data.entries)
    updateSummary(data.entries)

    dateInput.value = ''
    timeInput.value = ''

  } catch (error) {
    console.error('Time submission error:', error)

    document.querySelector('#timeStatus').textContent =
      'Unable to connect to the server.'
  }
}

const updateTable = function(entries) {
  const tableBody = document.querySelector('#resultsBody')

  tableBody.innerHTML = ''

  if (entries.length === 0) {
    const row = document.createElement('tr')
    const cell = document.createElement('td')

    cell.colSpan = 5
    cell.textContent = 'No attendance records found.'

    row.appendChild(cell)
    tableBody.appendChild(row)

    return
  }

  entries.forEach(function(entry) {
    const row = document.createElement('tr')

    const userCell = document.createElement('td')
    const dateCell = document.createElement('td')
    const dayCell = document.createElement('td')
    const timeCell = document.createElement('td')
    const actionCell = document.createElement('td')
    const editCell = document.createElement('td')
    const deleteCell = document.createElement('td')

    userCell.textContent = entry.user
    dateCell.textContent = entry.date
    dayCell.textContent = entry.day
    timeCell.textContent = entry.time

    if (entry.clockIn) {
      actionCell.textContent = 'Clock In'
    } else {
      actionCell.textContent = 'Clock Out'
    }

    //Only show Edit buttons when a user is logged in
    if (currentUser !== null) {
      const editButton = document.createElement('button')

      editButton.type = 'button'
      editButton.className = 'editButton'
      editButton.textContent = 'Edit'

      editButton.addEventListener('click', function() {startEdit(entry)})

      editCell.appendChild(editButton)


      const deleteButton = document.createElement('button')

      deleteButton.type = 'button'
      deleteButton.className = 'editButton'
      deleteButton.textContent = 'Delete'

      deleteButton.addEventListener('click', function() {deleteEntry(entry)})

      deleteCell.appendChild(deleteButton)
    }

    row.appendChild(userCell)
    row.appendChild(dateCell)
    row.appendChild(dayCell)
    row.appendChild(timeCell)
    row.appendChild(actionCell)
    row.appendChild(editCell)
    row.appendChild(deleteCell)

    tableBody.appendChild(row)
  })
}

// Calculate and display the time summary.
const updateSummary = function(entries) {
  const weeklyTimeElement = document.querySelector('#weeklyTime')
  const totalTimeElement = document.querySelector('#totalTime')
  const entryCountElement = document.querySelector('#entryCount')

  //num entries.
  entryCountElement.textContent = entries.length

  //total minutes and weekly minutes
  const totalHours = calculateTotalHours(entries)
  const weeklyHours = calculateWeeklyHours(entries)

  weeklyTimeElement.textContent = weeklyHours.toFixed(1) + ' hours'

  totalTimeElement.textContent = totalHours.toFixed(1) + ' hours'
}


const calculateTotalHours = function(entries) {

  const users = groupEntriesByUser(entries)

  let totalHours = 0

  // Calculate each user's time independently.
  Object.keys(users).forEach(function(user) {

    const userEntries = sortEntries(users[user])

    let clockInTime = null

    userEntries.forEach(function(entry) {

      const entryTime = parseEntryDecimalTime(entry)

      if (entryTime === null) {
        return
      }

      if (entry.clockIn) {

        clockInTime = entryTime

      } else if (clockInTime !== null) {

        const difference = entryTime - clockInTime

        if (difference >= 0) {
          totalHours += difference
        }

        clockInTime = null
      }
    })
  })

  return Math.round(totalHours * 10) / 10
}


const calculateWeeklyHours = function(entries) {

  const users = groupEntriesByUser(entries)

  const now = new Date()

  const startOfWeek = new Date(now)
  startOfWeek.setHours(0, 0, 0, 0)

  startOfWeek.setDate(now.getDate() - now.getDay())

  const endOfWeek = new Date(startOfWeek)
  endOfWeek.setDate(startOfWeek.getDate() + 7)

  let weeklyHours = 0

  // Calculate each user's time independently.
  Object.keys(users).forEach(function(user) {

    const userEntries = sortEntries(users[user])

    let clockInTime = null

    userEntries.forEach(function(entry) {

      const entryDate = parseEntryDateTime(entry)
      const entryDecimalTime = parseEntryDecimalTime(entry)

      if (
        entryDate === null ||
        entryDecimalTime === null
      ) {
        return
      }

      if (entry.clockIn) {

        clockInTime = { date: entryDate, decimalTime: entryDecimalTime}

      } else if (clockInTime !== null) {

        const clockOutDate = entryDate
        const clockOutDecimalTime = entryDecimalTime
    
        if (
          clockInTime.date >= startOfWeek &&
          clockOutDate < endOfWeek
        ) {

          const difference = clockOutDecimalTime - clockInTime.decimalTime

          if (difference >= 0) {
            weeklyHours += difference
          }
        }

        clockInTime = null
      }
    })
  })

  return Math.round(weeklyHours * 10) / 10
}


// Convert a stored date/time entry into a decimal hour. The result is rounded to the nearest tenth of an hour.
const parseEntryDecimalTime = function(entry) {

  const timeString = entry.time.trim()

  const timeMatch = timeString.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i)

  if (!timeMatch) {return null}

  let hour = parseInt(timeMatch[1], 10)
  const minute = parseInt(timeMatch[2], 10)
  const period = timeMatch[3].toUpperCase()

  if (period === 'PM' && hour !== 12) {hour += 12}
  if (period === 'AM' && hour === 12) {hour = 0}
  const decimalHour = hour + (minute / 60)

  return Math.round(decimalHour * 10) / 10
}


//Convert an entry into a JavaScript Date.
const parseEntryDateTime = function(entry) {
  const dateParts = entry.date.split('/')

  if (dateParts.length !== 3) {
    return null
  }

  const month = parseInt(dateParts[0], 10)
  const day = parseInt(dateParts[1], 10)
  const year = parseInt(dateParts[2], 10)

  let timeString = entry.time.trim()

  const timeMatch = timeString.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i)

  if (!timeMatch) {return null}

  let hour = parseInt(timeMatch[1], 10)
  const minute = parseInt(timeMatch[2], 10)
  const period = timeMatch[3].toUpperCase()

  if (period === 'PM' && hour !== 12) {hour += 12}

  if (period === 'AM' && hour === 12) {hour = 0}

  return new Date(
    year,
    month - 1,
    day,
    hour,
    minute
  )
}

const groupEntriesByUser = function(entries) {

  const users = {}

  entries.forEach(function(entry) {

    if (!users[entry.user]) {
      users[entry.user] = []
    }

    users[entry.user].push(entry)
  })

  return users
}

// Sort entries chronologically.
const sortEntries = function(entries) {
  return [...entries].sort(function(a, b) {
    const dateA = parseEntryDateTime(a)
    const dateB = parseEntryDateTime(b)

    if (dateA === null) {
      return 1
    }

    if (dateB === null) {
      return -1
    }

    return dateA - dateB
  })
}

const startEdit = function(entry) {

  editingId = entry._id
  editingEntry = entry

  const dateInput = document.querySelector('#dateInput')
  const timeInput = document.querySelector('#timeInput')

  dateInput.value = entry.date
  timeInput.value = entry.time

  //hide clock in/out buttons
  document.querySelector('#clockInSubmit').style.display = 'none'
  document.querySelector('#clockOutSubmit').style.display = 'none'

  //Show the edit buttons.
  document.querySelector('#confirmEditSubmit').style.display = 'inline-block'

  document.querySelector('#cancelEditSubmit').style.display = 'inline-block'

  document.querySelector('#timeStatus').textContent = 'Editing ' + entry.date + ' ' + entry.time + ' (' + (entry.clockIn ? 'Clock In' : 'Clock Out') + ')'
}

const confirmEdit = async function() {

  if (editingId === null) {return}

  const dateInput = document.querySelector('#dateInput')
  const timeInput = document.querySelector('#timeInput')

  const date = dateInput.value.trim()
  const time = timeInput.value.trim()

  if (date === '' || time === '') {
    document.querySelector('#timeStatus').textContent =
      'Please enter both a date and time.'

    return
  }

  const entry = editingEntry

  try {
    const response = await fetch('/edit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        id: editingId,
        date: date,
        time: time,
        clockIn: entry.clockIn
      })
    })

    const data = await response.json()

    if (!response.ok) {
      document.querySelector('#timeStatus').textContent =
        data.error || 'Unable to edit entry.'

      return
    }

    document.querySelector('#timeStatus').textContent = 'Entry updated successfully.'

    editingId = null
    editingEntry = null

    resetEditForm()

    updateTable(data.entries)
    updateSummary(data.entries)

  } catch (error) {
    console.error('Edit error:', error)

    document.querySelector('#timeStatus').textContent = 'Unable to connect to the server.'
  }
}

const cancelEdit = function() {

  editingId = null
  editingEntry = null

  resetEditForm()

  document.querySelector('#timeStatus').textContent = ''
}

const resetEditForm = function() {

  document.querySelector('#dateInput').value = ''
  document.querySelector('#timeInput').value = ''

  document.querySelector('#clockInSubmit').style.display = 'inline-block'
  document.querySelector('#clockOutSubmit').style.display = 'inline-block'
  document.querySelector('#confirmEditSubmit').style.display = 'none'
  document.querySelector('#cancelEditSubmit').style.display = 'none'
}

const deleteEntry = async function(entry) {

  if (currentUser === null) {
    document.querySelector('#tableStatus').textContent = 'Please log in before deleting an entry.'
    return
  }

  const confirmed = confirm('Are you sure you want to delete this attendance entry?')

  if (!confirmed) {return}

  try {

    const response = await fetch('/data/' + entry._id, {method: 'DELETE'})

    const data = await response.json()

    if (!response.ok) {
      document.querySelector('#tableStatus').textContent = data.error || 'Unable to delete entry.'
      return
    }

    document.querySelector('#tableStatus').textContent = 'Entry deleted successfully.'

    updateTable(data.entries)
    updateSummary(data.entries)

  } catch (error) {

    console.error('Delete error:', error)

    document.querySelector('#tableStatus').textContent = 'Unable to connect to the server.'
  }
}


//Set up all event handlers once the page has loaded.
window.onload = function() {
  const loginForm = document.querySelector('#loginForm')
  const logoutButton = document.querySelector('#logoutSubmit')
  const clockInButton = document.querySelector('#clockInSubmit')
  const clockOutButton = document.querySelector('#clockOutSubmit')
  const confirmEditButton = document.querySelector('#confirmEditSubmit')
  const cancelEditButton = document.querySelector('#cancelEditSubmit')

  loginForm.addEventListener('submit', login)
  logoutButton.addEventListener('click', logout)

  clockInButton.addEventListener('click', function(event) {
    submitTime(event, true)
  })
  clockOutButton.addEventListener('click', function(event) {
    submitTime(event, false)
  })
  
  confirmEditButton.addEventListener('click', confirmEdit)
  cancelEditButton.addEventListener('click', cancelEdit)
}