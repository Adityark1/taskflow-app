// client/src/components/tasks/TaskForm.jsx
import { useState } from 'react';

export default function TaskForm({ onTaskAdded }) {
  const [title, setTitle] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    await fetch('http://localhost:4000/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title }),
    });
    setTitle('');
    onTaskAdded(); // Refresh the list
  };

  return (
    <form onSubmit={handleSubmit}>
      <input 
        value={title} 
        onChange={(e) => setTitle(e.target.value)} 
        placeholder="New task..." 
        required 
      />
      <button type="submit">Add Task</button>
    </form>
  );
}