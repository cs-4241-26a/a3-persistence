let scoreTable = null

//-1 = not modifying, number = modifying that index/id
let modifyingRow = -1
let modifyingId = -1

const submit = async (event) => {
    event.preventDefault()

    const userName = document.querySelector('#userName').value,
        userScore = parseInt(document.querySelector('#userScore').value) | 0,
        userFaction = document.querySelector('#userFaction').value,
        oppName = document.querySelector('#oppName').value,
        oppScore = parseInt(document.querySelector('#oppScore').value) | 0,
        oppFaction = document.querySelector('#oppFaction').value,
        jsonData = { userName, userScore, userFaction, oppName, oppScore, oppFaction }

    let response
    if(modifyingRow === -1) {
        //submtitting new data
        response = await fetch('/submit', {
            method:'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(jsonData)
        })
    }
    else {
        //modifying existing data
        jsonData.modifyingId = modifyingId
        response = await fetch('/modify', {
            method:'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(jsonData)
        })
        clearModifying()
    }

    const games = await response.json()
    updateScoreTable(games)
}

const deleteGame = async (id) => {
    //remove currently modifying row in case it is the one being deleted - otherwise modifying would break
    clearModifying()

    const response = await fetch('/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({id})
    })

    const games = await response.json()
    updateScoreTable(games)
}

const clearModifying = () => { 
    if(modifyingRow != -1) { setModifying(modifyingRow, -1) }
}

const setModifying = (row, id) => {
    if(modifyingRow != row) {
        //reset the currently modifying game (needed to avoid 2 button highlights)
        clearModifying()
    }
    
    //used to highlight the relevant modify button's table cell
    const buttonCell = scoreTable.children[row+1].children[8]
    const button = buttonCell.children[0]
    const modifyInstructions = document.querySelector("#modifyInstructions")
    console.log(typeof(buttonCell.children[0].innerHTML))
    console.log(buttonCell.children[0].innerHTML)

    if(modifyingRow === row) {
        modifyingRow = -1
        modifyingId = -1
        buttonCell.className = ""
        //remove last character at the end if it is an asterisk (indicates that it was being modified)
        if(button.innerHTML.at(-1) == "*") { button.innerHTML = button.innerHTML.slice(0,-1) }
        modifyInstructions.className = "hidden"
    }
    else {
        modifyingRow = row
        modifyingId = id
        buttonCell.className = "modifying"
        button.innerHTML = button.innerHTML + "*"
        modifyInstructions.className = ""
    }
}

const updateScoreTable = (games) => {
    scoreTable.innerHTML = `<tr>
        <th>Your Name</th>
        <th>Your Score</th>
        <th>Your Faction</th>
        <th>Opponent's Name</th>
        <th>Opponent's Score</th>
        <th>Opponent's Faction</th>
        <th>Result</th>
        <th>Del.</th>
        <th id="modHeader">Mod.</th>
    </tr>` //last two headers are for delete and modify buttons

    for (let i = 0; i < games.length; i++) {
        let game = games[i]

        const deleteButton = document.createElement('button')
        deleteButton.innerHTML = '<img class="icon" src="../icons/delete.png" alt="Delete this game" />'
        deleteButton.onclick = async () => { await deleteGame(game._id) }
        const deleteButtonCell = document.createElement('td')
        deleteButtonCell.appendChild(deleteButton)

        const modifyButton = document.createElement('button')
        modifyButton.innerHTML = '<img class="icon" src="../icons/modify.png" alt="Modify this game (see instructions that appear below for more details)" />'
        modifyButton.onclick = () => { setModifying(i, game._id) }
        const modifyButtonCell = document.createElement('td')
        modifyButtonCell.appendChild(modifyButton)

        const tr = document.createElement('tr')
        tr.innerHTML = `
        <td>${game.userName}</td>
        <td>${game.userScore}</td>
        <td>${game.userFaction}</td>
        <td>${game.oppName}</td>
        <td>${game.oppScore}</td>
        <td>${game.oppFaction}</td>
        <td>${game.result}</td>
        `
        tr.appendChild(deleteButtonCell)
        tr.appendChild(modifyButtonCell)
        scoreTable.appendChild(tr)
    }

    document.querySelector('form').reset() //clear form
}

window.onload = async () => {
    //add submit function to the form instead of the button
        //so that default input validation works
    document.querySelector('form').onsubmit = submit

    scoreTable = document.createElement('table')
    document.body.children[0].append(scoreTable) //only child of body is main

    let modifyText = document.createElement('p')
    modifyText.innerText = "To modify the selected game (indicated by red background and marked with *),\nenter the new details into the form and press submit."
    modifyText.className = "hidden"
    modifyText.id = "modifyInstructions"
    document.body.children[0].append(modifyText)

    const response = await fetch('/games', { method: 'GET' })
    const games = await response.json()
    updateScoreTable(games)
}
