const express     = require( 'express' ),
      Todo        = require( '../models/Todo' ),
      requireAuth = require( '../middleware/requireAuth' )

const router = express.Router()
router.use( requireAuth )

const sendUserTodos = async function( response, owner ) {
  const todos = await Todo.find({ owner }).sort({ created: 1 })
  response.json( todos )
}

router.get( '/api/todos', async function( request, response ) {
  await sendUserTodos( response, request.session.username )
})

router.post( '/api/todos', async function( request, response ) {
  const { task, priority } = request.body
  if( !task || !task.trim() ) {
    return response.status( 400 ).json({ error: 'task is required' })
  }

  const todo = new Todo({
    owner: request.session.username,
    task: task.trim(),
    priority: [ 'high', 'medium', 'low' ].includes( priority ) ? priority : 'medium'
  })
  await todo.save()   // triggers the pre('save') hook above

  await sendUserTodos( response, request.session.username )
})

router.put( '/api/todos/:id', async function( request, response ) {
  const todo = await Todo.findOne({ _id: request.params.id, owner: request.session.username })
  if( !todo ) return response.status( 404 ).json({ error: 'not found' })

  if( request.body.task !== undefined )     todo.task = request.body.task.trim()
  if( request.body.priority !== undefined ) todo.priority = request.body.priority
  await todo.save()   // recalculates deadline from the (possibly new) priority

  await sendUserTodos( response, request.session.username )
})

router.delete( '/api/todos/:id', async function( request, response ) {
  await Todo.deleteOne({ _id: request.params.id, owner: request.session.username })
  await sendUserTodos( response, request.session.username )
})

module.exports = router