// FRONT-END (CLIENT) JAVASCRIPT HERE

// submit yayy
const submit = async function( event ) {
  event.preventDefault()

}

// function that creates the table 
async function update() {
    let list_entries = []
    const table = document.getElementById("table")
    // loop that creates the HTML to populate the grid of buttons 
    for(let i = 0; i < 10; i++) {
        let builder = ``;
        builder += `<tr>`
        for(let j = 0; j < 10; j++) {
            const result = await fetch( `/one/${i*10 + j}`, {
                method:  'GET',
                headers: { 'Content-Type': 'application/json' }
            })
            text = await result.text();
            const parsed = JSON.parse(text)
            if(parsed == null) {
                builder += `<td>
                <button command="show-modal" commandfor="dialog${i}${j}">door #${i*10 + j}</button>
                <dialog id="dialog${i}${j}">
                <p>there's no message here yet! maybe leave one~</p>
                <form action='/post/${i*10+j}' method='POST'> 
                    <input type='text' name='message'>
                    <input type='submit'>
                </form>
                <button commandfor="dialog${i}${j}" command="close">close</button>
                </dialog>
                </td>
                `         
            }
            else {
                builder += `<td>
                <button command="show-modal" commandfor="dialog${i}${j}">door #${i*10 + j}</button>
                <dialog id="dialog${i}${j}">
                <p>message: ${parsed.message}</p>
                <p>this message left by ${parsed.user}</p>
                <button commandfor="dialog${i}${j}" command="close">close</button>
                <button onclick="del(${i*10 + j})" class="del">take prize</button>
                </dialog>
                </td>
                `
            }
        }
        builder += `</tr>`
        const entry = document.createElement("template")
        entry.innerHTML = builder;
        list_entries.push(entry.content.firstChild)
  }
  table.replaceChildren(...list_entries)
}

const del = async function(loc) {
    console.log("delete these nuts")
    const result = await fetch( `/remove/${loc}`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' }
            })
    update()
}

window.onload = function() {
  update()
}