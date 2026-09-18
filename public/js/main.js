// FRONT-END (CLIENT) JAVASCRIPT HERE
// Declaring html element here so we can access it in all fucntions
let currentProblem = null;
let problemElement = null;
let leaderboardTable = null;
let correctDisplay;
let totalDisplay;
let accuracy;
let usernameDisplay
let answerProgress
let correctResult
let incorrectResult

let username = ""
let transitionTimer
const decimalFormat = new Intl.NumberFormat('en-US', {style: 'percent'})

const submit = async function( event ) {
  // stop form submission from trying to load
  // a new .html page for displaying results...
  // this was the original browser behavior and still
  // remains to this day
  event.preventDefault()

  correctResult.classList.remove('active')
  incorrectResult.classList.remove('active')
  
  const input = document.querySelector( '#answer' ),
        json = { 
          problem: currentProblem,
          answer: input.value },
        body = JSON.stringify( json )

  answerProgress.hidden = false
  const response = await fetch( '/submit', {
    method:'POST',
    headers: {'Content-Type': 'application/json'},
    body 
  })

  input.value = ""

  //Recieve JSON data from the server
  const data = await response.json();
  console.log( 'text:', data );

  answerProgress.hidden = true
  updateUserInfoDisplay(data.user_data)

  if (data.is_correct === "correct"){
    // Show "Correct" element for 4 seconds
    clearTimeout(transitionTimer)
    correctResult.classList.add('active')

    transitionTimer = setTimeout(function(){
      correctResult.classList.remove('active')
    }, 4000)

    currentProblem = data.problem
    problemElement.innerHTML = data.problem
    
  }
  else{
    // Show "incorrect" element for 4 seconds
    clearTimeout(transitionTimer)
    incorrectResult.classList.add('active')

    transitionTimer = setTimeout(function(){
      incorrectResult.classList.remove('active')
    }, 4000)

    currentProblem = data.problem
    problemElement.innerHTML = data.problem
  }

}

const start = async function(event){
  event.preventDefault()
  const nameInput = document.querySelector("#username")
  username = nameInput.value
  document.getElementById("usernameDisplay").innerText = username

  let menus = Array.from(document.getElementsByClassName("menu-element"))
  menus.map((element) => element.hidden = true)
  let game = Array.from(document.getElementsByClassName("game-element"))
  game.map((element) => element.hidden = false)

  let problemText = await requestNewProblem()
  problemElement.innerHTML = problemText
}

function updateLeaderboard(allPlayers){
  leaderboardTable.innerHTML = ""
  for (let i = 0; i < allPlayers.length; i++){
    leaderboardTable.innerHTML += `<tr>
            <td>${i + 1}</td>
            <td>${allPlayers[i].username}</td>
            <td>${allPlayers[i].correctGuesses}</td>
            <td>${allPlayers[i].totalGuesses}</td>
            <td>${decimalFormat.format(allPlayers[i].percentage)}</td>
          </tr>`
  }
}


async function requestNewProblem(){
  const response = await fetch('/new-problem',{method: "GET"})

  // Problem is a string that represents the problem the user will get. 
  let temp = await response.json()
  currentProblem = temp.problem
  console.log(currentProblem)
  //updateLeaderboard(temp.leaderboard)
  return currentProblem
}

function back(){
  currentProblem = null
  username = ""

  let menus = Array.from(document.getElementsByClassName("menu-element"))
  menus.map((element) => element.hidden = false)
  let game = Array.from(document.getElementsByClassName("game-element"))
  game.map((element) => element.hidden = true)
}

/**
 * 
 * @param {JSON} userData 
 */
function updateUserInfoDisplay(userData){
  usernameDisplay.innerText = `${userData.username}: Modify Profile`
  correctDisplay.innerText = `Correct Guesses: ${userData.correct_guesses}`
  totalDisplay.innerText = `Total Guesses: ${userData.total_guesses}`

  let accPerc
  if (userData.total_guesses > 0)
    accPerc = userData.correct_guesses / userData.total_guesses
  else
    accPerc = 0
  accuracy.innerText = `Accuracy: ${decimalFormat.format(accPerc)}`
  document.getElementById('full-name').innerText = `${userData.firstname || ''} ${userData.lastname || ''}`
}

window.onload = async function() {
  const submitButton = document.getElementById('submit')
  submitButton.onclick = submit

  problemElement = document.getElementById('problem')
  leaderboardTable = document.querySelector('#leaderboard-players')
  usernameDisplay = document.getElementById('username-display')
  correctDisplay = document.getElementById('correct-count')
  totalDisplay = document.getElementById('total-count')
  accuracy = document.getElementById('accuracy')
  answerProgress = document.getElementById('answer-waiting')
  correctResult = document.getElementById('correct-result')
  incorrectResult = document.getElementById('incorrect-result')
  
  // Get User Data and a problem to display
  const response = await fetch('/startgame', {method: 'GET'})
  const gameStartData = await response.json()
  console.log(gameStartData)

  updateUserInfoDisplay(gameStartData.userData)
  problemElement.innerHTML = gameStartData.newProblem
  currentProblem = gameStartData.newProblem
}
