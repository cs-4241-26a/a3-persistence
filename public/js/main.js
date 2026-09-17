// FRONT-END (CLIENT) JAVASCRIPT HERE

//initialized in window.onload
let ol = null;

//updates ol to match the server's data
//basically does what submit does, but as a dummy
//i'm sure there's a better way, but this way mostly works. 
const getInitialData = async function() {
    //create dummy json to send
    const json = {'initial': 'gimme my data'}
    const body = JSON.stringify( json )
    //post request to the server
    const response = await fetch( '/submit', {
        method:'POST',
        body 
    })
    //get response
    const arr = await response.json()
    //update list to match response
    updateList(arr)

    //add in the new entry submission field after main body has been loaded
    let htmlbody = document.querySelector('body') //things will be appended to <body>
    //add <hr> below main
    let hr = document.createElement('hr')
    htmlbody.appendChild(hr)
    //add form below <hr>
    let form = document.createElement('form')
    //everything except button:
    form.innerHTML = `<div class="inputrow">
                        Multiply
                        <input type='text' id='num1inp' placeholder='1st number'>
                        by
                        <input type='text' id='num2inp' placeholder='2nd number'>
                      </div>`
    //create button separately so we can give it a submit function
    let button = document.createElement('button')
    button.onclick = submit
    button.innerHTML = "<strong>QUERY THE ILLUSTRIOUS CALCULATOR</strong>"
    form.appendChild(button) //button goes in form
    htmlbody.appendChild(form) //form goes at end of body
    
}

//called whenever the submit button is pressed. 
//sends out a POST request to the server, eventually gets back a response. 
//replaces the contents of ol with this response. 
const submit = async function( event ) {
    // stop form submission from trying to load a new .html page for displaying results...
    // this was the original browser behavior and stillremains to this day
    event.preventDefault()
    
    const num1 = document.querySelector('#num1inp').value
    const num2 = document.querySelector('#num2inp').value
    const json = {'n1': num1, 
                  'n2': num2}
    const body = JSON.stringify( json )

    const response = await fetch( '/submit', {
        method:'POST',
        body 
    })

    const arr = await response.json()

    updateList(arr)
}

//updates the ol list to contain the data in arr
//arr must have json with fields n1, n2, res, comment, and id. 
const updateList = function(arr) {
    //first, clear the list. 
    ol.innerHTML = ''
    //then, add stuff back to the list. 
    //loops through all json items in the array. each one is a calculator result. 
    for (let [id, item] of Object.entries(arr)) {
        //the "article" is the one thing added to ol. everything else is added to article
        //henceforth, tabbing gives you a representation of who's the child of who
        let article = document.createElement('article')
            //main paragraph of text with the calculation
            const p = document.createElement('p')
            p.innerHTML = `MULTIPLYING ${item.n1} BY ${item.n2} RESULTS IN <strong>ILLUSTRIOUS</strong> ${item.res}`
            article.appendChild(p)

            //comment belpw
            const aside = document.createElement('aside')
            aside.innerText = `Illustrious comment: ${item.comment}`
            article.appendChild(aside)
            
            //span that contains the buttons to delete/edit this entry
            let span = document.createElement('span')
                //button to delete this entry
                const deleteButton = document.createElement('button')
                deleteButton.setAttribute("class", "deletebutton")
                deleteButton.innerText = "Delete this entry"
                span.appendChild(deleteButton)

                //button to edit this entry
                const editButton = document.createElement('button')
                editButton.innerText = "Edit this entry's result to be:"
                span.appendChild(editButton)

                //field that goes alongside edit button. contains the stuff that it'll be changed to. 
                const editField = document.createElement("input")
                editField.setAttribute("type", "text")
                editField.setAttribute("id", `edit${id}`)
                editField.setAttribute("placeholder", "New result:")
                span.appendChild(editField)
            article.appendChild(span)
        ol.appendChild(article)
        
        //buttons need to work!! here are the things that make them work. 
        //bulky and repetitive, but it functions just fine. 
        //delete button sends a delete request:
        deleteButton.onclick = async function(event) {
            event.preventDefault()
            const json = {'delete': id} //item id to delete specified
            const body = JSON.stringify( json )
            //post request to the server
            const response = await fetch( '/submit', {
                method:'POST',
                body 
            })
            //get response
            const arr = await response.json()
            //update list to match response
            updateList(arr)
        }
        //edit button sends an edit request
        editButton.onclick = async function(event) {
            event.preventDefault()
            const newVal = document.querySelector(`#edit${id}`).value
            const json = {'editid': id, //item id to edit specified
                          'newVal': newVal} //new content fetched from the associated text field, 2 lines of code up. 
            const body = JSON.stringify( json )
            //post request to the server
            const response = await fetch( '/submit', {
                method:'POST',
                body 
            })
            //get response
            const arr = await response.json()
            //update list to match response
            updateList(arr)
        }
        //wow, that's a lot for a single entry! time to do it again for every other calculation entry!! maybe a bit inefficient...
    }
}

//CODE THAT RUNS BEFORE PAGE LOADS. 
//was in "window.onload()", before, but now it starts everythinbg even before the page loads! nice!
//be able to access ordered list from javascript
ol = document.querySelector('#history')

//query the server, update ol to be true to the server's data as soon as possible
const get = await getInitialData()