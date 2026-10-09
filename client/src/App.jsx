import React, { useState, useEffect } from 'react'
import TodoForm from './TodoForm.jsx'
import TodoList from './TodoList.jsx'

const App = function() {
  const [ todos, setTodos ] = useState( [] )

  const loadTodos = async function() {
    const response = await fetch( '/api/todos' )
    if( response.status === 401 ) { window.location.href = '/login.html'; return }
    setTodos( await response.json() )
  }

  useEffect( function() { loadTodos() }, [] )

  const addTodo = async function( task, priority ) {
    const response = await fetch( '/api/todos', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ task, priority })
    })
    setTodos( await response.json() )
  }

  const saveTodo = async function( id, task, priority ) {
    const response = await fetch( `/api/todos/${ id }`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ task, priority })
    })
    setTodos( await response.json() )
  }

  const deleteTodo = async function( id ) {
    const response = await fetch( `/api/todos/${ id }`, { method: 'DELETE' })
    setTodos( await response.json() )
  }

  return (
    <div className='row g-4'>
      <div className='col-md-4'>
        <div className='card'>
          <div className='card-body'>
            <h2 className='h5 card-title'>Add a task</h2>
            <TodoForm onAdd={ addTodo } />
          </div>
        </div>
      </div>
      <div className='col-md-8'>
        <div className='card'>
          <div className='card-body'>
            <h2 className='h5 card-title'>Your tasks</h2>
            <TodoList todos={ todos } onSave={ saveTodo } onDelete={ deleteTodo } />
          </div>
        </div>
      </div>
    </div>
  )
}

export default App