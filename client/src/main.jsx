import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'

createRoot( document.getElementById( 'root' ) ).render( <App /> )


document.querySelector( '#logout-btn' ).addEventListener( 'click', async function() {
  await fetch( '/logout', { method: 'POST' } )
  window.location.href = '/login.html'
})

fetch( '/api/me' ).then( function( response ) {
  if( !response.ok ) { window.location.href = '/login.html'; return null }
  return response.json()
}).then( function( data ) {
  if( data ) document.querySelector( '#current-user' ).textContent = data.username
})