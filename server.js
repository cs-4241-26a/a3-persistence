const http = require( 'http' ),
      fs   = require( 'fs' ),
      // IMPORTANT: you must run `npm install` in the directory for this assignment
      // to install the mime library if you're testing this on your local machine.
      // On Render, make sure `npm install` is your build command.
      mime = require( 'mime' ),
      path = require( 'path' ),
      dir  = 'public/',
      port = 3000

const appdata = [
  { 'model': 'Toyota', 'year': 1999, 'color': 'red', 'mpg': 23, 'price': 9500 },
  { 'model': 'Honda', 'year': 2004, 'color': 'blue', 'mpg': 30, 'price': 24000 },
  { 'model': 'Ford', 'year': 1987, 'color': 'grey', 'mpg': 14, 'price': 5000 } 
]

const server = http.createServer( function( request,response ) {
  if( request.method === 'GET' ) {
    handleGet( request, response )    
  }else if( request.method === 'POST' ){
    handlePost( request, response ) 
  }else if( request.method === 'DELETE' ){
    handleDelete( request, response ) }
  })

const handleGet = function( request, response ) {
  const filename = dir + request.url.slice( 1 ) 

  if( request.url === '/' || request.url === '/index.html' ) {
    sendFile( response, 'public/index.html' )
  }
  else if ( request.url === '/data' ){
    response.writeHead( 200, { 'Content-Type': 'application/json' })
    response.end( JSON.stringify( appdata ) )
  }
  else{
    sendFile( response, filename )
  }
}

const calculateStats = function( userData ) {
  const year = parseInt(userData.year)

  let max_mpg, min_mpg = 0

  if (year <= 2000) {
    max_mpg = 25
    min_mpg = 10
  }
  else if (year <= 2010) {
    max_mpg = 30
    min_mpg = 15
  }
  else {
    max_mpg = 35
    min_mpg = 20
  }

  const userMPG = Math.floor(Math.random() * (max_mpg - min_mpg)) + min_mpg

  const price = userMPG * (1000) - ( (2026 - year) * 500 )

  if ( price < 5000 ) { price = 5000 }

  return {
    model: userData.model,
    year: userData.year,
    color: userData.color,
    mpg: userMPG,
    price: price,
  }
}

const handlePost = function( request, response ) {
  let dataString = ''

  request.on( 'data', function( data ) {
      dataString += data 
  })

  request.on( 'end', function() {
    const userData = JSON.parse( dataString )
    
    const newCar = calculateStats( userData )

    appdata.push( newCar )

    response.writeHead( 200, "OK", {'Content-Type': 'application/json' })
    response.end( JSON.stringify( appdata ) )
  })
}

const handleDelete = function ( request, response) {
  let dataString = ''

  request.on( 'data', function( data ) {
    dataString += data 
  })

  request.on( 'end', function() {
    const input = JSON.parse(dataString)
    const index = input.index
    if (index >=0 && index < appdata.length) {
      appdata.splice( index, 1 )
    }

    response.writeHead( 200, "OK", {'Content-Type': 'application/json' })
    response.end( JSON.stringify( appdata ) )
  })
}

const sendFile = function( response, filename ) {
   const type = mime.getType( filename ) 

   fs.readFile( filename, function( err, content ) {

     // if the error = null, then we've loaded the file successfully
     if( err === null ) {

       // status code: https://httpstatuses.com
       response.writeHeader( 200, { 'Content-Type': type })
       response.end( content )

     }else{

       // file not found, error code 404
       response.writeHeader( 404 )
       response.end( '404 Error: File Not Found' )

     }
   })
}

server.listen( process.env.PORT || port )
