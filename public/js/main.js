// FRONT-END (CLIENT) JAVASCRIPT HERE
let ul = null //null reference to ul, need to load the page before manipulating stuff in the DOM, want global scope so all fns can access
const list = null
let user = ""
const submitAdd = async function( event ) { //submit function
  // stop form submission from trying to load
  // a new .html page for displaying results...
  // this was the original browser behavior and still
  // remains to this day
  event.preventDefault()
  
  const item = document.querySelector( '#additem' ),
        count = document.querySelector( '#addcount' ),
        cost = document.querySelector( '#addcost' )
  
  const fieldsEmpty = item.value === "" || count.value === "" || cost.value === ""
  const json = { _id: crypto.randomUUID(), item: item.value, count: count.value, cost: cost.value, user: user }//attach ID as this is constructed, get it from the server?
        body = JSON.stringify( json )
     
  //console.log(json)
  if(!fieldsEmpty){
      //console.log("hit submit route")
      const response = await fetch( '/submit', {
      method:'POST',
      body 
    })
    const success = await response.json()
    if(!success.acknowledged){
      console.log("Insertion Error!")
    }
  } else {
    console.log("Fields are empty!") //do frontend warning here later!!!
  }
  const getresponse = await fetch('/getlist', {method: 'GET'})
  shoplist = await getresponse.json()
  loadList(shoplist)
  //add onto things here
  //console.log( arr ) //can run json parse here
  //loadList(arr)
}

const deleteEntry = async function(id){
  json = {_id: id}
  body = JSON.stringify(json)
  //console.log("deleteEntry called")
  const success = await fetch('/delete', {method:'POST', body})
  console.log(success)
  if(!success.status === 200){
    console.log("Deletion Error!")
  } 
  const getresponse = await fetch('/getlist', {method: 'GET'})
  shoplist = await getresponse.json()
  loadList(shoplist)
}
const addmode = async function( event ){
  event.preventDefault
  document.querySelector("#addmodebtn").className = "btn btn-primary"
  document.querySelector("#modifymodebtn").className = "btn btn-outline-primary"
  document.querySelector("#addelems").hidden = false
  document.querySelector("#modifyelems").hidden = true
  document.querySelector('#moditem').value = ""
  document.querySelector('#modcost').value = ""
  document.querySelector('#modcount').value = ""
}
const modmode = async function( event ){
  event.preventDefault
  document.querySelector("#addmodebtn").className = "btn btn-outline-primary"
  document.querySelector("#modifymodebtn").className = "btn btn-primary"
  document.querySelector("#addelems").hidden = true
  document.querySelector("#modifyelems").hidden = false
  document.querySelector('#additem').value = ""
  document.querySelector('#addcost').value = ""
  document.querySelector('#addcount').value = ""
}
const submitMod = async function ( event ){
  event.preventDefault()
  selection = document.querySelector("#moddropdown")
  const id = selection.value
  //selection.value is a string containing the selected value
  const item = document.querySelector( '#moditem' ),
        count = document.querySelector( '#modcost' ),
        cost = document.querySelector( '#modcount' )
  const fieldsEmpty = item.value === "" || count.value === "" || cost.value === "" || id === "none" || id === ""
  const json = { _id: id, item: item.value, count: count.value, cost: cost.value, user: user } //user field is the currently logged in user
        body = JSON.stringify( json )

  if(!fieldsEmpty){
      const response = await fetch( '/modify', {
      method:'POST',
      body 
    })
    const success = await response.json() 
    if(!success.acknowledged){
      console.log("Modification Error!")
    }
  } else {
    console.log("Fields are empty!") //do frontend warning here later!!!
  }
  const getresponse = await fetch('/getlist', {method: 'GET'})
  shoplist = await getresponse.json()
  loadList(shoplist)

}

const logout = async function ( event ){
  //console.log("logout ran on client side")
  event.preventDefault()
  const response = await fetch( '/logout', {
      method:'GET' 
    })
  if (response.redirected) {
      window.location.href = response.url;
    }
}



const loadList = function(arr){
  ul.innerHTML = ''
  selector = document.querySelector('#moddropdown')
  selector.innerHTML = '<option value="none">Select an Item</option>'
  total = 0
  for (let i of arr){
    //console.log(i)
    if(i.item === '' || i.user !== user){ //user of the item must match the current user to display
      continue
    }
      const li = document.createElement( 'li' )
      li.className = "listli"
      li.innerText = i.item + " x " + i.count + " = $" + (i.cost * i.count)//this updates
      ul.appendChild( li )
      const delbutton = document.createElement( 'button' )
      delbutton.id = i._id
      delbutton.className = "itembutton"
      delbutton.innerText = "X"
      delbutton.onclick = function(event){
        event.preventDefault()
        deleteEntry(delbutton.id)
      }
      //delbutton.onclick = delete(id) how to implement? async with param
      li.appendChild(delbutton)
      total += (i.count * i.cost)
      modOption = document.createElement( 'option' )
      modOption.innerText = i.item + " x " + i.count + " = $" + (i.cost * i.count)
      modOption.value = i._id
      selector.appendChild(modOption)
  }
  tdisp = document.getElementById('tdisp')
  tdisp.innerText = 'Total is ' + total + "$"
  tdisp.hidden = false
}

window.onload = async function() {
  const submitbutton = document.querySelector('#submitadd')
  submitbutton.onclick = submitAdd
  const addmodebtn = document.querySelector('#addmodebtn')
  addmodebtn.onclick = addmode 
  const modmodebtn = document.querySelector('#modifymodebtn')
  modmodebtn.onclick = modmode 
  const submitmod = document.querySelector('#submitmod')
  submitmod.onclick = submitMod
  const logoutbtn = document.querySelector('#logoutbtn')
  logoutbtn.onclick = logout
  ul = document.createElement( 'ul')
  ul.id = 'mainlist'
  document.body.appendChild( ul )
  const userResponse = await fetch('/getuser', {method: 'GET'})
  userJSON = await userResponse.json()
  user = userJSON.username
  const response = await fetch('/getlist', {method: 'GET'})
  shoplist = await response.json()
  loadList(shoplist)
  const currentUserTitle = document.querySelector('#currentUser')
  if(user === ""){
    currentUserTitle.innerText = "Not Logged In!"
    logoutbtn.innerText = "Log in!"
  } else {
    currentUserTitle.innerText = "Logged into: " + user
    logoutbtn.innerText = "Log Out"
  }
  
}
