// FRONT-END (CLIENT) JAVASCRIPT HERE

const submit = async function( event ) {
  // stop form submission from trying to load
  // a new .html page for displaying results...
  // this was the original browser behavior and still
  // remains to this day
  event.preventDefault()
  
  const entryname = document.getElementById("entryname").value,
        deadline  = Number(new Date(document.getElementById("deadline").value)),
        priority  = Number(document.getElementById("priority").value)

  const json = { "entry":entryname, "deadline":deadline, "priority":priority};
  const body = JSON.stringify( json );
  
  // console.log(json)
  // console.log(body)

  const response = await fetch( '/add', {
    method:'POST',
    headers: { 'Content-Type': 'application/json' },
    body 
  })

  const text = await response.text()

  // console.log( 'response:\n', text )
  update()
}

const update = async function() {
  const response = await fetch('/data')
  
  // parse data returned 
  const data = JSON.parse(await response.text())
  
  // get table object for addition
  const table = document.getElementById('table') 
  let tableChildren = []
  
  data.forEach(dataElm => {
    // make row 
    const row       = document.createElement("tr")
    const entry     = document.createElement("td")
    const deadline  = document.createElement("td")
    const priority  = document.createElement("td")
    const order     = document.createElement("td")
    const delBtn    = document.createElement("button")
    const orderAttr = document.createAttribute("order")

    // this is stupid but im doing it for the css requirements
    entry.classList.add("td")
    deadline.classList.add("td")
    priority.classList.add("td")
    order.classList.add("td")

    entry.appendChild(document.createTextNode(dataElm.entry))
    deadline.appendChild(document.createTextNode(fancifyTime(dataElm.deadline)))
    priority.appendChild(document.createTextNode(dataElm.priority))
    order.appendChild(document.createTextNode(dataElm.order))
    delBtn.appendChild(document.createTextNode("delete"))
    orderAttr.value = dataElm.order
    delBtn.setAttributeNode(orderAttr) 
    delBtn.onclick = delData

    row.appendChild(entry)
    row.appendChild(deadline)
    row.appendChild(priority)
    row.appendChild(order)
    row.appendChild(delBtn)
    
    // table.appendChild(row)
    tableChildren.push(row)
  });
  
  // re-add table headers 
  const template = document.createElement('template');
  template.innerHTML = '<tr><th>Entry:</th><th>Deadline:</th><th>Priority:</th><th>Order:</th><th></th></tr>'
  table.replaceChildren(template.content.firstChild, ...tableChildren)
} 

const delData = async function(event) {
  // gets the number attached to the attribute
  // console.log(event.target.getAttribute("order"))
  const json = {index:`${event.target.getAttribute("order")}`}
  const body = JSON.stringify(json)

  const response = await fetch('/remove', {
    method:'POST', 
    headers: { 'Content-Type': 'application/json' },
    body
  })
  const text = await response.text()

  // console.log( 'response:\n', text )
  update()
}

const fancifyTime = function(time) {
  let t = new Date(time);
  t.setMinutes(t.getMinutes() - t.getTimezoneOffset())
  tString = t.toISOString().slice(0, 16)
  tString = tString.replace("T", " ")
  return tString
}  

window.onload = function() {
  document.getElementById("deadline").value = fancifyTime(Date.now())

  const submit_ = document.getElementById('submit')
  submit_.onclick = submit

  const update_ = document.getElementById('refresh')
  update_.onclick = update
  
  update() 
}
