import { useEffect, useState } from 'react';
import TaskList from '../components/tasks/taskList';
import TaskForm from '../components/tasks/taskForm';

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [categories, setCategories] = useState([]); // Added state to track live categories
  const [currentTime, setCurrentTime] = useState(new Date());

  const fetchTasks = async () => {
    try {
      const res = await fetch('http://localhost:4000/api/tasks');
      const data = await res.json();
      setTasks(data);
    } catch (err) {
      console.error('Error fetching tasks:', err);
    }
  };

  // Added function to pull categories live from your SQLite database
  const fetchCategories = async () => {
    try {
      const res = await fetch('http://localhost:4000/api/categories');
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchCategories(); // Fetch categories right when the page mounts
    
    // Global continuous clock ticking for the bottom left viewport display
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  const formatGlobalDateTime = () => {
    const options = { weekday: 'short', month: 'short', day: 'numeric' };
    const dateStr = currentTime.toLocaleDateString('en-US', options);
    const timeStr = currentTime.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
    return `${dateStr} • ${timeStr}`;
  };

  return (
    <div style={{ position: 'relative', minHeight: '80vh', pb: '100px' }}>
      {/* Immersive Glass Backdrops */}
      <div style={{ position: 'absolute', top: '-10%', left: '20%', width: '650px', height: '650px', borderRadius: '50%', background: 'rgba(168, 85, 247, 0.07)', filter: 'blur(130px)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'absolute', top: '40%', right: '5%', width: '450px', height: '450px', borderRadius: '50%', background: 'rgba(59, 130, 246, 0.05)', filter: 'blur(110px)', pointerEvents: 'none', zIndex: 0 }} />

      <div style={{ position: 'relative', zIndex: 1, paddingBottom: '100px' }}>
        <div style={{ marginBottom: '40px', textAlign: 'center' }}>
          <h2
            style={{
              fontSize: '2.6rem',
              fontWeight: '800',
              marginBottom: '10px',
              letterSpacing: '-0.03em',
              background: 'linear-gradient(180deg, #ffffff 0%, #94a3b8 100%)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            What needs to be done today?
          </h2>
          <p style={{ color: '#475569', fontSize: '0.9rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Flow through tasks effortlessly
          </p>
        </div>

        {/* Input Card Container */}
        <div 
          style={{ 
            background: 'rgba(30, 41, 59, 0.25)',
            backdropFilter: 'blur(30px)',
            WebkitBackdropFilter: 'blur(30px)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            borderRadius: '24px',
            padding: '24px',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.3)',
            marginBottom: '40px'
          }}
        >
          {/* FIXED: Passing down the live categories array to the form component */}
          <TaskForm onTaskAdded={fetchTasks} categories={categories} />
        </div>

        {/* Dynamic Display Matrix Grid */}
        <TaskList tasks={tasks} refreshTasks={fetchTasks} />
      </div>

      {/* FIXED BOTTOM LEFT SCREEN DATE AND TIME WIDGET */}
      <div
        style={{
          position: 'fixed',
          bottom: '24px',
          left: '24px',
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          padding: '12px 20px',
          borderRadius: '16px',
          boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
          zIndex: 99,
          pointerEvents: 'none',
          display: 'flex',
          flexDirection: 'column',
          gap: '2px'
        }}
      >
        <span style={{ fontSize: '0.65rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>System Core Time</span>
        <span style={{ fontSize: '0.9rem', color: '#ffffff', fontWeight: '600', letterSpacing: '-0.01em' }}>
          {formatGlobalDateTime()}
        </span>
      </div>
    </div>
  );
}