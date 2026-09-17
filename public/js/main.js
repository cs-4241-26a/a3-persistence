// FRONT-END (CLIENT) JAVASCRIPT HERE

document.addEventListener("DOMContentLoaded", async () =>{
  const response = await fetch('/docs', {method :'GET'})
  const list = await response.json()
  console.log(list)
  for (let recipe of list){ 
    const card = buildCard(recipe)
    const recipes = document.querySelector('#recipes')
    recipes.appendChild(card)
  }
})

const submit = async function( event ) {
  // stop form submission from trying to load a new .html page for displaying results...
  event.preventDefault()
  
  const nameInput = document.querySelector( '#recipe-name' ),
        timeInput = document.querySelector('#cook-time'),
        ingredientLi = document.querySelectorAll('#ingredients-list > li > div > span'),
        instructionLi = document.querySelectorAll('#instructions-list > li > div > span'),
        submitBtn = document.querySelector('#submit'), 
        form = document.querySelector('form'),
        heading = document.querySelector('h2')

  
  //get ingredients and instructions out of displayed lists on form
  const listOfIngredients = []
  for (let item of ingredientLi){
    listOfIngredients.push(item.innerText)
  }

  const listOfInstructions = []
  for (let item of instructionLi){
    listOfInstructions.push(item.innerText)
  }
  //send the data
  const json = { recipeName: nameInput.value, 
    ingredients : listOfIngredients,
    instructions : listOfInstructions,  
    cookTime : parseInt(timeInput.value)}

  let route = ''
  if (submitBtn.dataset.action === "submit") route = '/add'
  else if (submitBtn.dataset.action === "edit"){
    route = '/update'
    json._id = form.dataset.id
  } 

  const body = JSON.stringify( json )
  console.log(`Sending ${body}`)
  const response = await fetch( route, {
    headers:  {'Content-Type' : 'application/json'},
    method:'POST',
    body : body
  })
  //reset form and add new recipe to page
  const ingredientList = document.querySelector("#ingredients-list"),
        instructionList = document.querySelector("#instructions-list")
  ingredientList.innerHTML = ''
  instructionList.innerHTML = ''

  const recipe = await response.json()
  console.log(recipe)

  //reset to add form if it was an edit one
  if (submitBtn.dataset.action == "edit"){
    const oldCard = document.querySelector(`article[data-id="${recipe._id}"]`)
    const newCard = buildCard(recipe)
    oldCard.replaceWith(newCard)
    delete form.dataset.id 
    submitBtn.dataset.action = "submit" 
    submitBtn.innerText = "Submit"
    heading.innerText = "Add Recipe:"
  }
  else{
    const card = buildCard(recipe)
    const recipes = document.querySelector('#recipes')
    recipes.appendChild(card)
  }
}

window.onload = async function() {
  let theme = await ui("theme", "#1f5731");
  const button = document.querySelector('#submit')
  //so this code only runs on main.html
  if(button){
    button.addEventListener('click', submit)
    const addButtons = document.querySelectorAll('.add')
    addButtons[0].onclick = () => addItem('ingredients')
    addButtons[1].onclick = () => addItem('instructions')
  }
}

function addItem(type, value){
  const list = document.querySelector(`#${type}-list`),
        input = document.querySelector(`#${type}`),
        item = document.createElement('li'),
        span = document.createElement('span')
  if(typeof value === 'undefined') { 
    span.innerText = input.value
  }
  else{
    span.innerText = value
  }

  const deleteBtn = document.createElement('button')
  deleteBtn.type = 'button'
  deleteBtn.innerText = 'X'

  span.classList.add('max')
  deleteBtn.classList.add('error')

  const row = document.createElement('div')
  row.appendChild(span)
  row.appendChild(deleteBtn)
  row.classList.add('row')
  item.appendChild(row)
  list.appendChild(item)
  deleteBtn.onclick = () => deleteBtn.closest('li').remove()
  input.focus()
  input.select()
}

function buildCard(recipe){
  const empty = document.querySelector('#empty')
  if(empty){
    empty.remove()
  }

  //building card for the recipe
  const card = document.createElement('article')
  card.classList.add('secondary', 'margin', 'padding')
  card.dataset.id =  recipe['_id']

  //add recipe details
  const recipeTitle = document.createElement('h3')
  recipeTitle.classList.add('top-padding')
  recipeTitle.innerText = recipe['recipeName']
  card.appendChild(recipeTitle)
  const line =document.createElement('hr')
  card.appendChild(line)


  const infoDiv = document.createElement('div')
  infoDiv.classList.add('row', 'top-padding')
  const timeSpan = document.createElement('span')
  timeSpan.innerText = `Cook time: ${recipe['cookTime']}`
  //timeSpan.classList.add('max')
  const diffSpan = document.createElement('span')
  diffSpan.innerText = `Difficulty: ${recipe['difficulty']}`
  infoDiv.appendChild(timeSpan)
  infoDiv.appendChild(diffSpan)
  card.appendChild(infoDiv)
  card.appendChild(document.createElement('hr'))

  const listDiv = document.createElement('div')
  listDiv.classList.add('grid', 'top-align', 'top-padding')
  
  const ingredientDiv = document.createElement('div')
  ingredientDiv.classList.add('l4')
  const ingredientList = document.createElement('ul')
  for (let ingredient of recipe['ingredients']){
     const item = document.createElement('li')
     item.classList.add('no-padding')
     item.innerText = ingredient
     ingredientList.appendChild(item)
  }
  ingredientDiv.appendChild(ingredientList)
  
  const instructDiv = document.createElement('div')
  instructDiv.classList.add('l8')
  const instructList = document.createElement('ol')

  for (let step of recipe['instructions']){
    const item = document.createElement('li')
    item.classList.add('no-padding')
    item.innerText = step
    instructList.appendChild(item)
  }
  instructDiv.appendChild(instructList)

  listDiv.appendChild(ingredientDiv)
  listDiv.appendChild(instructDiv)
  card.appendChild(listDiv)
  
  const buttonDiv = document.createElement('div'),
        deleteBtn = document.createElement('button'),
        editBtn = document.createElement('button')

  deleteBtn.type = 'button'
  deleteBtn.innerText = 'X'
  deleteBtn.classList.add('error')
  deleteBtn.addEventListener('click', async (event) => { 
    deleteBtn.closest('article').remove()
    const json = { _id : card.dataset.id }
    console.log(json)
    const response = await fetch('/remove', 
      {headers:  {'Content-Type' : 'application/json'},
        method :'POST', 
        body : JSON.stringify(json)} )
  })
  
  editBtn.type = 'button'
  editBtn.innerText = 'Edit Recipe'
  editBtn.classList.add('secondary-container')
  editBtn.addEventListener('click', async (event) => { 
     //change the form to an edit form
    const form = document.querySelector('form'),
        submitBtn = form.querySelector('#submit'),
        heading = form.querySelector('h2')
    form.dataset.id = card.dataset.id
    submitBtn.dataset.action = "edit" 
    submitBtn.innerText = "Submit changes"
    heading.innerText = `Editing recipe for ${recipe['recipeName']}:`

    //prefill the fields with the current data
    const inputs =  form.getElementsByTagName('input')    
    inputs[0].value = recipe['recipeName']
    inputs[1].value = recipe['cookTime']
    for(let ingredient of recipe['ingredients']){
      addItem('ingredients', ingredient)
    }
    for(let step of recipe['instructions']){
      addItem('instructions', step)
    }
  })

  
  buttonDiv.classList.add('row', 'right-align')
  buttonDiv.appendChild(editBtn)
  buttonDiv.appendChild(deleteBtn)
  card.appendChild(buttonDiv)
  return card
}



// function buildTable(recipe){
//   const empty = document.querySelector('#empty')
//   if(empty){
//     empty.remove()
//   }
//   //building table for the recipe
//   const table = document.createElement('table')
//   table.classList.add('border')
//   recipes.appendChild(table)
//   table.dataset.id =  recipe['_id']

//   const thead = document.createElement('thead')
//   const tbody = document.createElement('tbody')
//   table.appendChild(thead)
//   table.appendChild(tbody)
//   thead.appendChild(document.createElement('tr'))
//   for(let i = 1; i < 3; i++){
//     tbody.appendChild(document.createElement('tr'))
//   }
//   rows = table.querySelectorAll('tr')
    
//   //fill rows w/ data
//   const nameTH = document.createElement('th')
//   nameTH.colSpan = 3
//   nameTH.innerText = recipe['recipeName']
//   rows[0].appendChild(nameTH)

//   const timeTD = document.createElement('td')
//   timeTD.innerText = `Cook time: ${recipe['cookTime']}`
//   timeTD.classList.add('timeTd')
//   const diffTD = document.createElement('td')
//   diffTD.innerText = `Difficulty: ${recipe['difficulty']}`

//   const buttonTD = document.createElement('td'),
//         deleteBtn = document.createElement('button'),
//         editBtn = document.createElement('button')

//   deleteBtn.type = 'button'
//   deleteBtn.innerText = 'X'
//   deleteBtn.classList.add('delete')
//   deleteBtn.addEventListener('click', async (event) => { 
//     deleteBtn.closest('table').remove()
//     const json = { _id : table.dataset.id }
//     console.log(json)
//     const response = await fetch('/remove', 
//       {headers:  {'Content-Type' : 'application/json'},
//         method :'POST', 
//         body : JSON.stringify(json)} )
//   })

//   editBtn.type = 'button'
//   editBtn.innerText = 'Edit Recipe'
//   editBtn.classList.add('edit')
//   editBtn.addEventListener('click', async (event) => { 
//     //change the form to an edit form
//     const form = document.querySelector('form'),
//         submitBtn = form.querySelector('#submit'),
//         heading = form.querySelector('h2')
//     form.dataset.id = table.dataset.id
//     submitBtn.dataset.action = "edit" 
//     submitBtn.innerText = "Submit changes"
//     heading.innerText = `Editing recipe for ${recipe['recipeName']}:`

//     //prefill the fields with the current data
//     const inputs =  form.getElementsByTagName('input')    
//     inputs[0].value = recipe['recipeName']
//     inputs[1].value = recipe['cookTime']
//     for(let ingredient of recipe['ingredients']){
//       addItem('ingredients', ingredient)
//     }
//     for(let step of recipe['instructions']){
//       addItem('instructions', step)
//     }
//   })

  
//   buttonTD.classList.add('buttonTD')
//   buttonTD.appendChild(editBtn)
//   buttonTD.appendChild(deleteBtn)
  
//   rows[1].appendChild(diffTD)
//   rows[1].appendChild(timeTD)
//   rows[1].appendChild(buttonTD)

//   const ingredientList = document.createElement('ul')
//   for (let ingredient of recipe['ingredients']){
//     const item = document.createElement('li')
//     item.innerText = ingredient
//     ingredientList.appendChild(item)
//   }
//   const ingredientTD = document.createElement('td')
//   ingredientTD.appendChild(ingredientList)
//   rows[2].appendChild(ingredientTD)

//   const instructList = document.createElement('ol')
//   for (let step of recipe['instructions']){
//     const item = document.createElement('li')
//     item.innerText = step
//     instructList.appendChild(item)
//   }
//   const instructTD = document.createElement('td')
//   instructTD.colSpan = 2
//   instructTD.appendChild(instructList)
//   rows[2].appendChild(instructTD)
//   return table
// }