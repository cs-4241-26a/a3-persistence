const requireLoginPage = function( request, response, next ) {
  if( request.session && request.session.userId ) {
    next()
  }else{
    response.redirect( '/' )
  }
}

const requireLoginApi = function( request, response, next ) {
  if( request.session && request.session.userId ) {
    next()
  }else{
    response.status( 401 ).json( { error: 'Not logged in' } )
  }
}

module.exports = { requireLoginPage, requireLoginApi }
