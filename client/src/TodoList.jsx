import React from 'react'
import TodoItem from './TodoItem.jsx'

const TodoList = function({ todos, onSave, onDelete }) {
  if( todos.length === 0 ) return <p className='text-muted fst-italic'>No tasks yet, add one!</p>

  return (
    <table className='table align-middle'>
      <thead><tr><th>Task</th><th>Priority</th><th>Deadline</th><th></th></tr></thead>
      <tbody>
        { todos.map( todo => <TodoItem key={ todo._id } todo={ todo } onSave={ onSave } onDelete={ onDelete } /> ) }
      </tbody>
    </table>
  )
}

export default TodoList