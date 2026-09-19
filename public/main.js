// FRONT-END (CLIENT) JAVASCRIPT HERE

let editId = null

const displayBooks = function( data ) {
  const readingList = document.querySelector( '#readingList' )

  readingList.innerHTML = ''

  data.forEach( function( book, index ) {
    readingList.innerHTML += 
    `<tr>
    <td>${book.book}</td>
    <td>${book.author}</td>
    <td>${book.pagesRead}</td>
    <td>${book.totalPages}</td>
    <td>${book.percentComplete}%</td>
    <td>${book.status}</td>
    <td>${book.format}</td>
    <td>${book.genre ? book.genre.join(', ') : ''}</td>
    <td>${book.rating}</td>
    <td>${book.notes}</td>
    <td>
    <button class="btn btn-primary btn-sm editButton" data-id="${book._id}" data-index="${index}">Edit</button>
    <button class="btn btn-secondary btn-sm deleteButton" data-id="${book._id}">Delete</button>
    </td>
    </tr>`
  })

  const editButtons = document.querySelectorAll( '.editButton' )

  editButtons.forEach( function( button ) {
    button.onclick = function() {
      const index = button.getAttribute( 'data-index' )
      const id = button.getAttribute( 'data-id' )
      editBook( index, id, data )
    }
  })

  const deleteButtons = document.querySelectorAll( '.deleteButton' )
  deleteButtons.forEach( function( button ) {
    button.onclick = function() {
        const id = button.getAttribute( 'data-id' )
        deleteBook( id )
    }
  })
}

const editBook = function( index, id, data ) {
  editId = id

  document.querySelector( '#book' ).value = data[index].book
  document.querySelector( '#author' ).value = data[index].author
  document.querySelector( '#pagesRead' ).value = data[index].pagesRead
  document.querySelector( '#totalPages' ).value = data[index].totalPages
  document.querySelector( '#status' ).value = data[index].status
  document.querySelector( '#notes' ).value = data[index].notes

  const format = document.querySelector(
    `input[name="format"][value="${data[index].format}"]`
  )

  if ( format ) {
    format.checked = true
  }

  const genres = document.querySelectorAll( 'input[name="genre"]' )
  
  genres.forEach( function( genre ) {
  genre.checked = data[index].genre
    ? data[index].genre.includes( genre.value )
    : false
  })

  const rating = document.querySelector(
    `input[name="rating"][value="${data[index].rating}"]`
  )

  if ( rating ) {
    rating.checked = true
  }
}

const deleteBook = async function( id ) {
  const json = { 
    _id: id,
    userId: localStorage.getItem('userId')
  }, 
  
  body = JSON.stringify( json )
  
  const response = await fetch( '/delete', {
    method:'POST',
    headers: { 'Content-Type': 'application/json' },
    body
  })
  
  await response.json()
  
  loadBooks()
}

const submit = async function( event ) {
  // stop form submission from trying to load
  // a new .html page for displaying results...
  // this was the original browser behavior and still
  // remains to this day
  event.preventDefault()
  
  const book = document.querySelector( '#book' ),
        author = document.querySelector( '#author' ),
        pagesRead = document.querySelector( '#pagesRead' ),
        totalPages = document.querySelector( '#totalPages' ),
        status = document.querySelector( '#status' ),
        format = document.querySelector( 'input[name="format"]:checked' ),
        genres = document.querySelectorAll( 'input[name="genre"]:checked' ),
        rating = document.querySelector( 'input[name="rating"]:checked' ),
        notes = document.querySelector( '#notes' ),

        genre = Array.from( genres ).map( function( checkbox ) {
          return checkbox.value
        }),

        json = { book: book.value, 
          author: author.value, 
          pagesRead: pagesRead.value, 
          totalPages: totalPages.value, 
          status: status.value, 
          format: format ? format.value : '', 
          genre: genre,
          rating: rating ? rating.value : '', 
          notes: notes.value, 
          userId: localStorage.getItem('userId'),
          _id: editId
        },
        body = JSON.stringify( json )

    let route = '/submit'

    if ( editId ) {
      route = '/update'
    }

  const response = await fetch( route, {
    method:'POST',
    headers: { 'Content-Type': 'application/json' },
    body 
  })

  await response.json()

  const successMessage = document.querySelector( '#successMessage' )
  successMessage.classList.remove( 'd-none' )

  editId = null
  loadBooks()
}

const loadBooks = async function() {
  const userId = localStorage.getItem('userId')
  const response = await fetch( `/data?userId=${userId}` )
  const text = await response.text()

  const data = JSON.parse( text )
  displayBooks( data )
}

window.onload = function() {
  const form = document.querySelector('form')
  form.onsubmit = submit

  loadBooks()
}