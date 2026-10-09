import React, { useState } from 'react'

const dateFormatter = new Intl.DateTimeFormat( 'en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
const formatDate = iso => dateFormatter.format( new Date( iso ) )
const priorityColor = p => p === 'high' ? 'danger' : p === 'medium' ? 'warning' : 'success'

const TodoItem = function({ todo, onSave, onDelete }) {
  const [ isEditing, setIsEditing ] = useState( false )
  const [ task, setTask ] = useState( todo.task )
  const [ priority, setPriority ] = useState( todo.priority )

  const handleSave = async function() { await onSave( todo._id, task, priority ); setIsEditing( false ) }
  const handleCancel = function() { setTask( todo.task ); setPriority( todo.priority ); setIsEditing( false ) }

  if( isEditing ) {
    return (
      <tr>
        <td><input type='text' className='form-control form-control-sm' value={ task } onChange={ e => setTask( e.target.value ) } /></td>
        <td>
          <select className='form-select form-select-sm' value={ priority } onChange={ e => setPriority( e.target.value ) }>
            <option value='high'>high</option><option value='medium'>medium</option><option value='low'>low</option>
          </select>
        </td>
        <td>{ formatDate( todo.deadline ) }</td>
        <td className='text-end'>
          <button className='btn btn-sm btn-success' onClick={ handleSave }>Save</button>{ ' ' }
          <button className='btn btn-sm btn-outline-secondary' onClick={ handleCancel }>Cancel</button>
        </td>
      </tr>
    )
  }

  return (
    <tr>
      <td>{ todo.task }</td>
      <td><span className={ `badge bg-${ priorityColor( todo.priority ) }` }>{ todo.priority }</span></td>
      <td>{ formatDate( todo.deadline ) }</td>
      <td className='text-end'>
        <button className='btn btn-sm btn-outline-primary' onClick={ () => setIsEditing( true ) }>Edit</button>{ ' ' }
        <button className='btn btn-sm btn-outline-danger' onClick={ () => onDelete( todo._id ) }>Delete</button>
      </td>
    </tr>
  )
}

export default TodoItem