  async function handleSubmit( event ) {
    // stop form submission from trying to load
    // a new .html page for displaying results...
    // this was the original browser behavior and still
    // remains to this day
    event.preventDefault()

    const name = document.querySelector( '#yourname' )
    const type = document.querySelector('#assignmenttype')
    const grade = document.querySelector('#gradeletter')
    const comment = document.querySelector('#cmts')
          json = { yourname: name.value,
                  assignmenttype: type.value,
                  gradeletter: grade.value,
                  cmts: comment.value
          },
          body = JSON.stringify( json )
          console.log("sending assingment payload:", json)
    const response = await fetch( '/submit', {
      method:'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body 
    })
    await displayUserEntries(event)
    
  }

  const remove = async function ( event, itemId ){
    event.preventDefault()
    const cleanedId = itemId || event.currentTarget.getAttribute('id')
    const data = { id: cleanedId }
    const response = await fetch('/remove', {
      method: 'DELETE',
      headers:{
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
    event.target.parentElement.remove()
    
  }

  async function displayUserEntries(event) {
    event.preventDefault()
        const response = await fetch('/get-entries')
        
        const arr = await response.json()
        ul.innerHTML = ''
        for (let item of arr){
        const li = document.createElement('li')
        li.innerHTML = `<span class="listlabel">Name:</span> <span class="values">${item.yourname}</span><br>
                    <span class="listlabel">Assignment Type:</span> <span class="values">${item.assignmenttype}</span><br>
                    <span class="listlabel">Grade:</span> <span class="values">${item.gradeletter}</span><br>
                    <span class="listlabel">Comments:</span> <span class="values">${item.cmts}</span><br>
                    <button class = "btn btn-primary" id='${item._id}' onclick="remove(event, '${item._id}')">delete</button><br>
                    <button class = "btn btn-primary" id='${item._id}' onclick="edit(event, '${item._id}')">edit</button><br>`
        ul.appendChild(li)
      }
      console.log(arr)

    
  }

  const edit = async function (event, itemId) {
    event.preventDefault()
    const cleanedId = itemId || event.currentTarget.getAttribute('id')
    
    const newType = prompt("Enter new Assignment Type (hw, quiz, test, project):")
 
    const newGrade = prompt("Enter new Letter Grade (a, b, c, d):")
 
    const newComments = prompt("Enter new Comments:")
 
    const payload = {
         id: cleanedId,
         assignmenttype: newType,
         gradeletter: newGrade,
         cmts: newComments
    }
    const response = await fetch('/edit', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    })
    await displayUserEntries(event)
  }



  window.onload = function() {
    const submitButton = document.getElementById('submitButton')
    if (submitButton) {
        submitButton.onclick = handleSubmit
    }
    ul = document.createElement('ul')
    document.body.appendChild(ul)
    displayUserEntries(event)
  }