module.exports = function requireAuth(request, response, next) {
    if(!request.session.username) {
        return response.status(401).json({error: 'Not logged in'})
    }
    next()
}