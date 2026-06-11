import { useState } from 'react';

export default function TaskList({ tasks = [], refreshTasks }) {
  const [selectedTask, setSelectedTask] = useState(null);
  const [originRect, setOriginRect] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);

  // Modal Fields states
  const [editTitle, setEditTitle] = useState('');
  const [editCategory, setEditCategory] = useState('General');
  const [editStatus, setEditStatus] = useState('To Do');
  const [editPriority, setEditPriority] = useState('Medium');
  const [editDueDate, setEditDueDate] = useState('');
  const [editDueTime, setEditDueTime] = useState('');
  const [editRepeat, setEditRepeat] = useState(false);

  // INSTANT IN-PLACE ONE-CLICK COMPLETION
  const toggleCompleteQuick = async (task, e) => {
    e.stopPropagation();
    const updatedStatus = task.status === 'Completed' ? 'To Do' : 'Completed';
    try {
      await fetch(`http://localhost:4000/api/tasks/${task.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: task.title,
          status: updatedStatus,
          priority: task.priority || 'Medium',
          category: task.category || 'General',
          due_date: task.due_date || '',
          due_time: task.due_time || '',
          repeat_daily: task.repeat_daily || 0
        })
      });
      if (refreshTasks) refreshTasks();
    } catch (err) {
      console.error('Error instantly toggle-updating item status:', err);
    }
  };

  const openExpansionModal = (task, e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setOriginRect(rect);
    setSelectedTask(task);
    
    setEditTitle(task.title || '');
    setEditCategory(task.category || 'General');
    setEditStatus(task.status || 'To Do');
    setEditPriority(task.priority || 'Medium');
    setEditDueDate(task.due_date || '');
    setEditDueTime(task.due_time || '');
    setEditRepeat(task.repeat_daily === 1 || task.repeat_daily === true);

    setTimeout(() => setIsExpanded(true), 20);
  };

  const closeExpansionModal = () => {
    setIsExpanded(false);
    setTimeout(() => {
      setSelectedTask(null);
      setOriginRect(null);
    }, 250);
  };

  const handleUpdateSave = async () => {
    try {
      await fetch(`http://localhost:4000/api/tasks/${selectedTask.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editTitle,
          status: editStatus,
          priority: editPriority,
          category: editCategory,
          due_date: editDueDate,
          due_time: editDueTime,
          repeat_daily: editRepeat ? 1 : 0
        })
      });
      if (refreshTasks) refreshTasks();
      closeExpansionModal();
    } catch (err) {
      console.error('Failed saving edits:', err);
    }
  };

  const handleDelete = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      await fetch(`http://localhost:4000/api/tasks/${id}`, {
        method: 'DELETE',
      });
      if (refreshTasks) refreshTasks();
      closeExpansionModal();
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const getPriorityColor = (p) => {
    if (p === 'High') return '#ef4444';
    if (p === 'Low') return '#10b981';
    return '#3b82f6';
  };

  const priorityConfig = {
    Low: { color: '#10b981' },
    Medium: { color: '#3b82f6' },
    High: { color: '#ef4444' },
  };

  // Helper function to turn '2026-06-11' into something readable like 'Jun 11'
  const formatCardDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
  };

  // Helper function to turn military time '14:30' into standard '2:30 PM'
  const formatCardTime = (timeStr) => {
    if (!timeStr) return '';
    const [hour, minute] = timeStr.split(':');
    const H = parseInt(hour, 10);
    const suffix = H >= 12 ? 'PM' : 'AM';
    const standardHour = H % 12 || 12;
    return `${standardHour}:${minute} ${suffix}`;
  };

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px', width: '100%' }}>
        {tasks.map((task) => {
          const accentColor = getPriorityColor(task.priority);
          const isDone = task.status === 'Completed';
          
          return (
            <div
              key={task.id}
              onClick={(e) => openExpansionModal(task, e)}
              style={{
                background: 'rgba(30, 41, 59, 0.4)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                padding: '24px',
                borderRadius: '24px',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                minHeight: '175px', // slightly increased to fit deadlines nicely
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
                transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                cursor: 'pointer',
                opacity: isDone ? 0.6 : 1,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-6px)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)';
              }}
            >
              <div>
                <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
                  
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flex: 1 }}>
                    <div 
                      onClick={(e) => toggleCompleteQuick(task, e)}
                      style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        border: isDone ? '2px solid #10b981' : '2px solid rgba(255, 255, 255, 0.25)',
                        background: isDone ? '#10b981' : 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        flexShrink: 0
                      }}
                    >
                      {isDone && (
                        <div style={{ width: '8px', height: '4px', borderLeft: '2px solid white', borderBottom: '2px solid white', transform: 'rotate(-45deg) translate(1px, -1px)' }} />
                      )}
                    </div>

                    <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#ffffff', fontWeight: '600', letterSpacing: '-0.01em', textDecoration: isDone ? 'line-through' : 'none', opacity: isDone ? 0.5 : 1 }}>
                      {task.title}
                    </h3>
                  </div>

                  <span style={{ fontSize: '0.68rem', fontWeight: '800', padding: '3px 9px', borderRadius: '999px', border: `1px solid ${accentColor}`, background: `${accentColor}15`, color: accentColor, flexShrink: 0 }}>
                    {task.priority || 'Medium'}
                  </span>
                </div>
                
                {/* CONFIG DETAILS ROW (Category & Dynamic Deadline Badges) */}
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.72rem', color: '#94a3b8', background: 'rgba(255,255,255,0.04)', padding: '4px 8px', borderRadius: '6px' }}>
                    {task.category || 'General'}
                  </span>

                  {/* DYNAMIC DEADLINE WIDGET DISPLAY */}
                  {(task.due_date || task.due_time) && (
                    <span 
                      style={{ 
                        fontSize: '0.72rem', 
                        color: isDone ? '#64748b' : '#f59e0b', 
                        background: isDone ? 'rgba(255,255,255,0.02)' : 'rgba(245, 158, 11, 0.08)', 
                        border: isDone ? '1px solid rgba(255,255,255,0.04)' : '1px solid rgba(245, 158, 11, 0.15)',
                        padding: '3px 8px', 
                        borderRadius: '6px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      🕒 {task.due_date ? formatCardDate(task.due_date) : ''} {task.due_time ? formatCardTime(task.due_time) : ''}
                    </span>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px' }}>
                <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '500' }}>
                  Status: <span style={{ color: isDone ? '#10b981' : '#38bdf8', fontWeight: '700' }}>{task.status || 'To Do'}</span>
                </span>
                
                {(task.repeat_daily === 1 || task.repeat_daily === true) && (
                  <span style={{ fontSize: '0.72rem', color: '#a855f7', fontWeight: '600' }}>Repeats Daily</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* POPUP ADVANCED EXPANSION VIEW */}
      {selectedTask && originRect && (
        <div
          onClick={closeExpansionModal}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(7, 10, 18, 0.45)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            zIndex: 99999,
            opacity: isExpanded ? 1 : 0,
            transition: 'opacity 0.3s ease',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'fixed',
              top: isExpanded ? '50%' : `${originRect.top + originRect.height / 2}px`,
              left: isExpanded ? '50%' : `${originRect.left + originRect.width / 2}px`,
              width: isExpanded ? '460px' : `${originRect.width}px`,
              height: isExpanded ? 'auto' : `${originRect.height}px`,
              transform: isExpanded ? 'translate(-50%, -50%) scale(1)' : 'translate(-50%, -50%) scale(0.85)',
              background: 'rgba(20, 26, 43, 0.95)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '28px',
              padding: isExpanded ? '32px' : '20px',
              boxShadow: '0 50px 100px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.1)',
              transition: 'all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
              opacity: isExpanded ? 1 : 0,
              overflow: 'hidden',
              boxSizing: 'border-box'
            }}
          >
            {isExpanded && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <h2 style={{ fontSize: '1.45rem', fontWeight: '700', color: '#ffffff', margin: 0, letterSpacing: '-0.02em' }}>
                  Modify Task Flow
                </h2>

                <div>
                  <label style={labelStyle}>Task Title</label>
                  <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} style={inputStyle} />
                </div>

                <div>
                  <label style={labelStyle}>Priority Tier</label>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    {['Low', 'Medium', 'High'].map((p) => {
                      const isSelected = editPriority === p;
                      const cfg = priorityConfig[p];
                      return (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setEditPriority(p)}
                          style={{
                            padding: '8px 20px',
                            borderRadius: '999px',
                            border: isSelected ? `1px solid ${cfg.color}` : '1px solid rgba(255, 255, 255, 0.04)',
                            background: isSelected ? `linear-gradient(135deg, ${cfg.color}dd 0%, ${cfg.color}ff 100%)` : `${cfg.color}10`,
                            color: isSelected ? '#ffffff' : cfg.color,
                            cursor: 'pointer',
                            fontSize: '0.8rem',
                            fontWeight: '700',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          {p}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '14px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>Category</label>
                    <select value={editCategory} onChange={(e) => setEditCategory(e.target.value)} style={inputStyle}>
                      <option value="General">General</option>
                      <option value="Work">Work</option>
                      <option value="Personal">Personal</option>
                      <option value="Health">Health</option>
                    </select>
                  </div>

                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>Status State</label>
                    <select value={editStatus} onChange={(e) => setEditStatus(e.target.value)} style={inputStyle}>
                      <option value="To Do">To Do</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '14px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>Due Date</label>
                    <input type="date" value={editDueDate} onChange={(e) => setEditDueDate(e.target.value)} style={inputStyle} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>Specific Time</label>
                    <input type="time" value={editDueTime} onChange={(e) => setEditDueTime(e.target.value)} style={inputStyle} />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(15,23,42,0.3)', padding: '14px 18px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.04)' }}>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: '600', color: '#ffffff', display: 'block' }}>Repeat Flow Everyday</span>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Runs infinitely until disabled</span>
                  </div>
                  
                  <div 
                    onClick={() => setEditRepeat(!editRepeat)}
                    style={{
                      width: '50px',
                      height: '28px',
                      background: editRepeat ? '#a855f7' : 'rgba(255,255,255,0.1)',
                      borderRadius: '99px',
                      position: 'relative',
                      cursor: 'pointer',
                      transition: 'background 0.25s ease'
                    }}
                  >
                    <div 
                      style={{
                        width: '22px',
                        height: '22px',
                        background: '#ffffff',
                        borderRadius: '50%',
                        position: 'absolute',
                        top: '3px',
                        left: editRepeat ? '25px' : '3px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.4)',
                        transition: 'left 0.25s cubic-bezier(0.25, 1, 0.5, 1)'
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                  <button onClick={(e) => handleDelete(selectedTask.id, e)} style={dangerBtnStyle}>
                    Delete Task
                  </button>
                  <button onClick={handleUpdateSave} style={saveBtnStyle}>
                    Save Actions
                  </button>
                </div>

              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const labelStyle = {
  display: 'block',
  fontSize: '0.7rem',
  fontWeight: '700',
  textTransform: 'uppercase',
  color: '#475569',
  marginBottom: '6px',
  letterSpacing: '0.04em'
};

const inputStyle = {
  width: '100%',
  padding: '12px 14px',
  borderRadius: '12px',
  border: '1px solid rgba(255,255,255,0.06)',
  background: 'rgba(15, 23, 42, 0.45)',
  color: '#ffffff',
  fontSize: '0.9rem',
  outline: 'none',
  boxSizing: 'border-box'
};

const dangerBtnStyle = {
  flex: 1,
  padding: '14px',
  borderRadius: '14px',
  background: 'rgba(239, 68, 68, 0.1)',
  border: '1px solid rgba(239, 68, 68, 0.2)',
  color: '#ef4444',
  fontWeight: '600',
  cursor: 'pointer',
  transition: 'all 0.2s'
};

const saveBtnStyle = {
  flex: 1,
  padding: '14px',
  borderRadius: '14px',
  background: 'linear-gradient(135deg, #a855f7 0%, #6b21a8 100%)',
  border: 'none',
  color: '#ffffff',
  fontWeight: '600',
  cursor: 'pointer',
  boxShadow: '0 4px 15px rgba(168, 85, 247, 0.25)'
};