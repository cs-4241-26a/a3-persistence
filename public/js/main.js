window.onload = function() {
  loadContent()
}

const loadContent = async function(){
  if(window.location.pathname == '/index.html'){
    const username = await check_login()
    if(username){
      fetch_allRecipes()
      const createform = document.querySelector('#create-recipe')
      createform.onsubmit = post_newRecipe
    }
  }

  if(window.location.pathname == '/profile.html'){
    const username = await check_login()
    if(username){
      display_username(username)
      fetch_myRecipes()
    }
  }
}

function display_username(username) {
  const section = document.getElementById('profile-info')
  section.insertBefore(
    newElem({type:'h2',text:`Profile for ${username}`,classes:['centered']}),
    section.firstChild
  )
}

const check_login = async function() {
  const response = await fetch( '/amiloggedin', {
    method:'GET'
  })

  const returnedtext = await response.text()

  username = JSON.parse(returnedtext).username
  if(!username){
    window.location.replace('login.html')
  }
  return username
}

// Requests all of the preexisting recipe data
const fetch_allRecipes = async function( event ) {
  const response = await fetch( '/allrecipes', {
    method:'GET' 
  })

  const returnedtext = await response.text()

  allrecipes = JSON.parse( returnedtext )
  console.log( 'all recipes', allrecipes )

  const recipeList = document.getElementById('recipe-list')

  for(let recipe of allrecipes) {
    recipeList.appendChild(createHTMLRecipeCardWithAuthor(recipe));
  }
}

// Requests the preexisting recipe data for the current logged-in user
const fetch_myRecipes = async function( event ) {
  const response = await fetch( '/myrecipes', {
    method:'GET' 
  })

  const returnedtext = await response.text()

  allrecipes = JSON.parse( returnedtext )
  const recipeList = document.getElementById('recipe-list')

  for(let recipe of allrecipes) {
    recipeList.appendChild(createHTMLRecipeCardWithDelete(recipe));
  }
}

// Submits a new recipe to the server
const post_newRecipe = async function( event ) {
  // stop form submission from trying to load new page
  event.preventDefault()

  const name = document.querySelector( '#recipename' ),
        preptime = document.querySelector( '#preptime' ),
        cooktime = document.querySelector( '#cooktime' ),
        ingredients = document.querySelector( '#ingredients' ),
        steps = document.querySelector( '#steps' ),
        json = {name: name.value,
                preptime:preptime.valueAsNumber,
                cooktime:cooktime.valueAsNumber,
                ingredients:ingredients.value,
                steps:steps.value
              },
        body = JSON.stringify( json )

  const response = await fetch( '/newrecipe', {
    method:'POST',
    headers: {'Content-Type': 'application/json'},
    body: body
  })

  const returnedtext = await response.text()
  console.log( 'response:', returnedtext )

  newRecipe = JSON.parse( returnedtext )
  console.log( 'new recipe', newRecipe )
  console.log(`Recipe recieved: ${ newRecipe.name } ${ newRecipe.ingredients }`)

  const recipeList = document.getElementById('recipe-list')

  recipeList.appendChild(createHTMLRecipeCardWithAuthor(newRecipe))
  document.querySelector('#create-recipe').reset()
}

// Asks the server to delete the recipe with the given ID
const post_deleteRecipe = async function( event ) {
  // stop form submission from trying to load new page
  event.preventDefault()

  recipeCard = event.target.parentElement.parentElement

  recipeId = recipeCard.id
  console.log('htmlid: ', recipeId)
  id = recipeId.substring(6)
  console.log('extractedid: ', id)

  body = JSON.stringify({id: id})

  const response = await fetch( '/deleterecipe', {
    method:'POST',
    headers: {'Content-Type': 'application/json'},
    body: body
  })

  recipeCard.remove()
}

function createHTMLRecipeCardWithAuthor(newRecipe){
  newRecipeCard = createHTMLRecipeCard(newRecipe)
  newRecipeCard.appendChild(newElem({
    type:'author-card',
    text:`${newRecipe.author}`,
    classes:['pure-u-1-2']
  }))
  return newRecipeCard
}

function createHTMLRecipeCardWithDelete(newRecipe){
  newRecipeCard = createHTMLRecipeCard(newRecipe)

  // Creates the delete button in a 100%-width wrapper
  const buttonWrapper = newElem({type:'button-wrapper',classes:['pure-u-1']})
  const deleteButton = newElem({type:'input',classes:['pure-button']});
  deleteButton.setAttribute('type','button')
  deleteButton.setAttribute('value','Delete')
  buttonWrapper.appendChild(deleteButton)
  newRecipeCard.appendChild(buttonWrapper)
  deleteButton.onclick = post_deleteRecipe
  return newRecipeCard
}

// Generates the HTML to hold a recipe
function createHTMLRecipeCard(newRecipe){
  // Create recipe card
  const newRecipeCard = newElem({
    type:'article',
    id:`recipe${newRecipe._id}`,
    classes:['pure-g']
  })

  // Add title to recipe card
  newRecipeCard.appendChild(newElem({
    type:'h3',
    text:`${newRecipe.name}`,
    classes:['pure-u-1']
  }))

  // Add time info to recipe card
  const newTimeInfo = newElem({type:'time-info', classes:['pure-u-1']})
  newTimeInfo.appendChild(newTimeElem('Prep time', newRecipe.preptime))
  newTimeInfo.appendChild(newTimeElem('Cook time', newRecipe.cooktime))
  newTimeInfo.appendChild(newTimeElem('Total time', newRecipe.totaltime))
  newRecipeCard.appendChild(newTimeInfo);
  
  // Add ingredients
  const newIngredients = newElem({type:'div', classes:['pure-u-1-2']})
  newIngredients.appendChild(newElem({
    type:'ingredient-card',
    text:`${newRecipe.ingredients}`
  }))
  newRecipeCard.appendChild(newIngredients)

  // Add steps
  const newSteps = newElem({type:'div', classes:['pure-u-1-2']})
  newSteps.appendChild(newElem({
    type:'step-card',
    text:`${newRecipe.steps}`
  }))
  newRecipeCard.appendChild(newSteps)

  return newRecipeCard
}

// Returns a new html element with the given type, text, id, and classes (array)
function newElem({type, text, id, classes}){
  const element = document.createElement(type)
  if(text){
    const textNode = document.createTextNode(text)
    element.appendChild(textNode)
  }
  if(id){
    element.id=id
  }
  if(classes){
    for (let c of classes){
      element.classList.add(c)
    }
  }
  return element
}

// Creates a time-item with with the given label and "[time] minutes" in a span
function newTimeElem(label, time){
  let newTime = newElem({type:'time-item', text:label})
  let span = null
  if(time){
    span = newElem({type:'span', text:`${time} minutes`})
  }
  else {
    span = document.createElement('span')
  }
  newTime.appendChild(span)
  return newTime
}