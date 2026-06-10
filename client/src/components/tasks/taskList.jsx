// client/src/components/tasks/TaskList.jsx
import { useEffect, useState } from 'react';

export default function TaskList() {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    fetch('http://localhost:4000/api/tasks')
      .then(res => res.json())
      .then(data => setTasks(data))
      .catch(err => console.error("Error fetching tasks:", err));
  }, []);

  return (
    <div>
      <h2>Your Tasks</h2>
      <ul>
        {tasks.map(task => (
          <li key={task.id}>{task.title} - {task.status}</li>
        ))}
      </ul>
    </div>
  );
} 