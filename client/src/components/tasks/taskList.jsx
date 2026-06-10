import { useEffect, useState } from 'react';

export default function TaskList() {
  const [tasks, setTasks] = useState([]);

  const fetchTasks = () => {
    fetch('http://localhost:4000/api/tasks')
      .then((res) => res.json())
      .then((data) => setTasks(data))
      .catch((err) => console.error('Error fetching tasks:', err));
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleDelete = async (id) => {
    try {
      await fetch(`http://localhost:4000/api/tasks/${id}`, {
        method: 'DELETE',
      });

      setTasks(tasks.filter((task) => task.id !== id));
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  return (
    <div>
   

     <div
  style={{
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '24px',
    marginTop: '20px',
    alignItems: 'start',
  }}
>
        {tasks.map((task) => (
          <div
            key={task.id}
            style={{
  background: '#1e293b',
  padding: '20px',
  borderRadius: '24px',
  border: '1px solid #334155',

  width: '280px',
  minHeight: '180px',

  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',

  transition: '0.2s ease',
}}  
          >
            <h3 style={{ marginBottom: '10px' }}>{task.title}</h3>

           {task.category_name && (
  <p
    style={{
      color: task.category_color || '#94a3b8',
      marginBottom: '8px',
      fontWeight: '600',
    }}
  >
    {task.category_name}
  </p>
)}

            <p
              style={{
                marginBottom: '15px',
              }}
            >
              Status: {task.status}
            </p>

            <button
              onClick={() => handleDelete(task.id)}
              style={{
                background: '#dc2626',
                color: 'white',
                border: 'none',
                padding: '8px 14px',
                borderRadius: '8px',
                cursor: 'pointer',
              }}
            >  
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}