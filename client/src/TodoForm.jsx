import React, { useState } from 'react'

const TodoForm = function({ onAdd }) {
  const [ task, setTask ] = useState( '' )
  const [ priority, setPriority ] = useState( 'medium' )

  const handleSubmit = async function( event ) {
    event.preventDefault()
    if( !task.trim() ) return
    await onAdd( task.trim(), priority )
    setTask( '' )
  }

  return (
    <form onSubmit={ handleSubmit }>
      <div className='mb-3'>
        <label htmlFor='task' className='form-label'>Task</label>
        <input type='text' id='task' className='form-control' required maxLength={ 120 }
          value={ task } onChange={ e => setTask( e.target.value ) } />
      </div>
      <div className='mb-3'>
        <label htmlFor='priority' className='form-label'>Priority</label>
        <select id='priority' className='form-select' value={ priority } onChange={ e => setPriority( e.target.value ) }>
          <option value='high'>High &mdash; due in 1 day</option>
          <option value='medium'>Medium &mdash; due in 3 days</option>
          <option value='low'>Low &mdash; due in 7 days</option>
        </select>
      </div>
      <button type='submit' className='btn btn-primary w-100'>Add task</button>
    </form>
  )
}

export default TodoForm