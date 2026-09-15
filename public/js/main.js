// FRONT-END (CLIENT) JAVASCRIPT HERE
// let ul = null
let display = null

const build_table = function(table, json_arr) {
  table.innerHTML = ""
  for (let item of json_arr) {
    // debugger
    const trow = document.createElement('tr')
    const tname = document.createElement('td')
    const tsub = document.createElement('td')
    const tdue = document.createElement('td')
    const turg = document.createElement('td')
    const tdelete = document.createElement('td')


    // trow.innerText = JSON.stringify(item)
    tname.innerHTML = `<p>${item.name}</p>`
    tsub.innerHTML = `<p>${item.duration}</p>`
    tdue.innerHTML = `<p>${item.due}</p>`
    turg.innerHTML = `<p>${item.urgency}</p>`
    tdelete.innerHTML = `<button class="pure-button del-btn" type="button" data-id="${item._id}">Delete</button>
                         <button class="pure-button edit-btn" type="button" data-id="${item._id}">Edit</button>`

    trow.id = `row-${item._id}`
    
    table.appendChild(trow)
    trow.appendChild(tname)
    trow.appendChild(tsub)
    trow.appendChild(tdue)
    trow.appendChild(turg)
    trow.appendChild(tdelete)

    let btns = document.querySelectorAll(".del-btn")
    for (let btn of btns) {
      btn.onclick = function() {
        // debugger
        console.log(btn.dataset.id)
        delete_row(btn.dataset.id)
      }
    }

    const dialog = document.querySelector("#edit-dialog");
    const form = document.querySelector("#form-dialog")
    let btns2 = document.querySelectorAll(".edit-btn") 
    for (let btn of btns2) {
      btn.onclick = function() {
        // const edit_btn = document.createElement('button')
        const edit_btn = document.querySelector("#modal-edit-btn")
        edit_btn.dataset.id = btn.dataset.id
        edit_btn.innerHTML = "Modify"
        const input_name = document.querySelector( '#modal-name' ),
              input_sub = document.querySelector( '#modal-sub' ),
              input_due = document.querySelector( '#modal-due' )
        edit_btn.onclick = function() {
          edit_row(this.dataset.id, input_name.value, input_sub.value, input_due.value)
        }

        form.appendChild(edit_btn)
        dialog.showModal()

      }
    }

  }
}

const submit = async function( event ) {
  // stop form submission from trying to load
  // a new .html page for displaying results...
  // this was the original browser behavior and still
  // remains to this day
  event.preventDefault()
  
  const input_name = document.querySelector( '#hw_name' ),
        input_sub = document.querySelector( '#hw_sub' ),
        input_due = document.querySelector( '#hw_due' ),
        json = { id: -1, name: input_name.value, duration: input_sub.value, due: input_due.value },
        body = JSON.stringify( json )

  if (input_name.value === '') {
    return
  }

  const response = await fetch( '/submit', {
    method:'POST',
    headers: { 'Content-Type': 'application/json' },
    body 
  })

  const arr = await response.text()
  build_table(display, JSON.parse(arr))

  console.log(JSON.parse(arr))
}

const delete_row = async function( data ) {
  body = JSON.stringify({id:data, name:""})
  console.log(`posting: ${body}`)

  const response = await fetch( '/submit', {
    method:'POST',
    headers: { 'Content-Type': 'application/json' },
    body
  })

  // debugger


  const arr = await response.text()
  build_table(display, JSON.parse(arr))
  console.log(JSON.parse(arr))
}


const edit_row = async function( replace, name, length, due ) {
  body = JSON.stringify({id:replace, name:name, duration:length, due:due})
  console.log(`posting: ${body}`)

  const response = await fetch( '/submit', {
    method:'POST',
    headers: { 'Content-Type': 'application/json' },
    body
  })

  const arr = await response.text()
  build_table(display, JSON.parse(arr))
  console.log(JSON.parse(arr))
}

const reload = async function( event ) {  
  const user_text = document.querySelector("#user-text")

  const response = await fetch('/entries', {method:'GET'})
  const arr = await response.text()
  const response2 = await fetch('/user/username', {method:'GET'})
  const arr2 = await response2.text()
  user_text.innerHTML = `Welcome, ${JSON.parse(arr2)}`

  build_table(display, JSON.parse(arr))
  console.log(JSON.parse(arr))
}


window.onload = function() {
  const submit_btn = document.querySelector("#submit")

  submit_btn.onclick = submit
  display = document.querySelector("#display")
  reload()
}
