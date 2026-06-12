import { useState, useEffect } from 'react';

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [allTasks, setAllTasks] = useState([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState('#a855f7');

  // Core Layout Animation States
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [originRect, setOriginRect] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);

  // Category Configuration States
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('#a855f7');
  const [isListeningCategory, setIsListeningCategory] = useState(false);

  // Deletion Warning Modal States
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Deep Task Editing Modal States
  const [activeTaskToEdit, setActiveTaskToEdit] = useState(null);
  const [editTaskTitle, setEditTaskTitle] = useState('');
  const [editTaskCategory, setEditTaskCategory] = useState('General');
  const [editTaskStatus, setEditTaskStatus] = useState('To Do');
  const [editTaskPriority, setEditTaskPriority] = useState('Medium');
  const [editTaskDueDate, setEditTaskDueDate] = useState('');
  const [editTaskDueTime, setEditTaskDueTime] = useState('');
  const [editTaskRepeat, setEditTaskRepeat] = useState(false);

  const systemDefaults = ['general', 'work', 'personal', 'health'];
  const priorityConfig = {
    Low: { color: '#10b981' },
    Medium: { color: '#3b82f6' },
    High: { color: '#ef4444' },
  };

  const fetchData = async () => {
    try {
      const catRes = await fetch('http://localhost:4000/api/categories');
      if (catRes.ok) {
        const catData = await catRes.json();
        setCategories(catData);
      }
      const taskRes = await fetch('http://localhost:4000/api/tasks');
      if (taskRes.ok) {
        const taskData = await taskRes.json();
        setAllTasks(taskData);
      }
    } catch (err) {
      console.error('Data hydration failure:', err);
    }
  };

  useEffect(() => {
    fetchData();

    // 🚀 INSTANT REAL-TIME ELECTRONIC SYNCHRONIZATION EAR
    const handleInstantSyncEvent = (event) => {
      const { action, task, category, taskId } = event.detail;
      console.log(`⚡ Categories UI intercepting operational broadcast: ${action}`);

      switch (action) {
        case 'CREATE_CATEGORY':
          if (category) {
            setCategories((prev) => {
              if (prev.some(c => c.id === category.id)) return prev;
              return [...prev, category];
            });
          }
          break;

        case 'UPDATE_CATEGORY':
          if (category) {
            setCategories((prev) => prev.map(c => c.id === category.id ? category : c));
            setSelectedCategory((current) => {
              if (current && current.id === category.id) {
                setEditName(category.name);
                setEditColor(category.color);
                return category;
              }
              return current;
            });
          }
          break;

        case 'CREATE_TASK':
          if (task) {
            setAllTasks((prev) => [...prev, task]);
          }
          break;

        case 'UPDATE_TASK':
        case 'COMPLETE_TASK':
          if (task) {
            setAllTasks((prev) => prev.map(t => t.id === task.id ? task : t));
            setActiveTaskToEdit((current) => (current && current.id === task.id ? task : current));
          }
          break;

        case 'DELETE_TASK':
          if (taskId) {
            setAllTasks((prev) => prev.filter(t => t.id !== Number(taskId) && t.title !== taskId));
            setActiveTaskToEdit((current) => (current && (current.id === Number(taskId) || current.title === taskId) ? null : current));
          }
          break;

        default:
          // Catch-all fallback validation to prevent drift
          fetchData();
          break;
      }
    };

    window.addEventListener('taskflow-db-update', handleInstantSyncEvent);
    return () => {
      window.removeEventListener('taskflow-db-update', handleInstantSyncEvent);
    };
  }, []);

  const handleVoiceListen = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }
    setIsListeningCategory(true);
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.start();

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript.trim();
      const formatted = transcript.charAt(0).toUpperCase() + transcript.slice(1);
      setNewCategoryName(formatted);
      setIsListeningCategory(false);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListeningCategory(false);
    };
  };

  const handleCreateCategory = async (e) => {
    if (e) e.preventDefault();
    if (!newCategoryName.trim()) return;

    try {
      const res = await fetch('http://localhost:4000/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCategoryName.trim(), color: newCategoryColor })
      });

      if (res.ok) {
        const data = await res.json();
        setNewCategoryName('');
        
        // Dispatch local event if added manually to update dropdown hooks instantly
        const updateEvent = new CustomEvent('taskflow-db-update', { 
          detail: { action: 'CREATE_CATEGORY', category: data } 
        });
        window.dispatchEvent(updateEvent);
        await fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const triggerDeleteWorkflow = (cat, e) => {
    if (e) e.stopPropagation();
    if (systemDefaults.includes(cat.name.toLowerCase())) {
      alert('System Protection: This core workflow node cannot be removed.');
      return;
    }
    setDeleteTarget(cat);
  };

  const commitDeletionStrategy = async (strategy) => {
    if (!deleteTarget) return;
    try {
      const targetUrl = `http://localhost:4000/api/categories/${deleteTarget.id}?strategy=${strategy}&name=${encodeURIComponent(deleteTarget.name)}`;
      const res = await fetch(targetUrl, { method: 'DELETE' });
      
      if (res.ok) {
        setDeleteTarget(null);
        closeExpansionModal();
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const openExpansionModal = (cat, e) => {
    if (deleteTarget) return;

    const rect = e.currentTarget.getBoundingClientRect();
    setOriginRect(rect);
    setSelectedCategory(cat);
    setEditName(cat.name);
    setEditColor(cat.color);
    setActiveTaskToEdit(null);

    setTimeout(() => setIsExpanded(true), 20);
  };

  const closeExpansionModal = () => {
    setIsExpanded(false);
    setTimeout(() => {
      setSelectedCategory(null);
      setOriginRect(null);
      setActiveTaskToEdit(null);
    }, 250);
  };

  const handleSaveCategoryEdits = async () => {
    try {
      const res = await fetch(`http://localhost:4000/api/categories/${selectedCategory.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editName, color: editColor })
      });
      if (res.ok) {
        fetchData();
        closeExpansionModal();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const openNestedTaskEdit = (task) => {
    setActiveTaskToEdit(task);
    setEditTaskTitle(task.title || '');
    setEditTaskCategory(task.category || 'General');
    setEditTaskStatus(task.status || 'To Do');
    setEditTaskPriority(task.priority || 'Medium');
    setEditTaskDueDate(task.due_date || '');
    setEditTaskDueTime(task.due_time || '');
    setEditTaskRepeat(task.repeat_daily === 1 || task.repeat_daily === true);
  };

  const handleSaveNestedTask = async () => {
    try {
      await fetch(`http://localhost:4000/api/tasks/${activeTaskToEdit.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editTaskTitle,
          status: editTaskStatus,
          priority: editTaskPriority,
          category: editTaskCategory,
          due_date: editTaskDueDate,
          due_time: editTaskDueTime,
          repeat_daily: editTaskRepeat ? 1 : 0
        })
      });
      fetchData();
      setActiveTaskToEdit(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleNestedTaskDelete = async (id) => {
    try {
      await fetch(`http://localhost:4000/api/tasks/${id}`, { method: 'DELETE' });
      fetchData();
      setActiveTaskToEdit(null);
    } catch (error) {
      console.error(error);
    }
  };

  const filteredTasks = selectedCategory
    ? allTasks.filter(t => t.category?.toLowerCase() === selectedCategory.name.toLowerCase())
    : [];

  return (
    <div style={pageContainerStyle}>
      
      <div style={headerTextWrapperStyle}>
        <h2 style={mainTitleTextStyle}>What categories to manage?</h2>
        <p style={subTitleTextStyle}>ORGANIZE YOUR WORKFLOWS EFFORTLESSLY</p>
      </div>

      {/* INPUT PANEL WITH PURPLE GLOW ON FOCUS */}
      <div style={formPanelStyle}>
        <form onSubmit={handleCreateCategory} style={formInlineStyle}>
          <input 
            type="text" 
            placeholder="Create a new category..."
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            required
            style={inputFieldStyle}
            onFocus={(e) => {
              const parent = e.currentTarget.closest('div');
              if (parent) {
                parent.style.borderColor = 'rgba(168, 85, 247, 0.4)';
                parent.style.boxShadow = '0 0 20px rgba(168, 85, 247, 0.15)';
              }
            }}
            onBlur={(e) => {
              const parent = e.currentTarget.closest('div');
              if (parent) {
                parent.style.borderColor = 'rgba(255, 255, 255, 0.05)';
                parent.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.2)';
              }
            }}
          />
          
          <button
            type="button"
            onClick={handleVoiceListen}
            style={{
              background: 'transparent',
              border: 'none',
              color: isListeningCategory ? '#a855f7' : '#475569',
              fontSize: '0.82rem',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              cursor: 'pointer',
              padding: '0 8px',
              transition: 'color 0.2s ease'
            }}
          >
            voice
          </button>
          
          <div style={{ ...colorCircleWrapperStyle, background: newCategoryColor }}>
            <input 
              type="color" 
              value={newCategoryColor}
              onChange={(e) => setNewCategoryColor(e.target.value)}
              style={nativeColorInputHiddenStyle}
            />
          </div>

          <button type="submit" style={submitButtonStyle}>+</button>
        </form>
      </div>

      {/* THREE COLUMN GRID */}
      <div style={gridContainerStyle}>
        {categories.map((cat) => {
          const isProtected = systemDefaults.includes(cat.name.toLowerCase());
          const associatedCount = allTasks.filter(t => t.category?.toLowerCase() === cat.name.toLowerCase()).length;
          
          return (
            <div
              key={cat.id}
              onClick={(e) => openExpansionModal(cat, e)}
              style={{ ...cardStyle, opacity: associatedCount === 0 ? 0.75 : 1 }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-6px)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)';
                e.currentTarget.style.boxShadow = `0 15px 35px rgba(0, 0, 0, 0.35), 0 0 20px ${cat.color}15`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)';
                e.currentTarget.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.2)';
              }}
            >
              <div>
                <div style={{ display: 'flex', gap: '14px', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flex: 1 }}>
                    <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: cat.color, boxShadow: `0 0 12px ${cat.color}`, flexShrink: 0 }} />
                    <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#ffffff', fontWeight: '600', letterSpacing: '-0.01em' }}>
                      {cat.name}
                    </h3>
                  </div>

                  {isProtected ? (
                    <span style={lockBadgeStyle}>System</span>
                  ) : (
                    <button 
                      onClick={(e) => triggerDeleteWorkflow(cat, e)} 
                      style={cardCrossDeleteButtonStyle}
                      onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'}
                      onMouseLeave={(e) => e.currentTarget.style.color = '#475569'}
                    >
                      ✕
                    </button>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '6px' }}>
                  <span style={{ fontSize: '0.72rem', color: '#94a3b8', background: 'rgba(255,255,255,0.04)', padding: '4px 10px', borderRadius: '6px', fontWeight: '600', letterSpacing: '0.02em' }}>
                    {associatedCount} {associatedCount === 1 ? 'Task' : 'Tasks'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* EXPANDED MODAL VIEW */}
      {selectedCategory && originRect && (
        <div onClick={closeExpansionModal} style={{ position: 'fixed', inset: 0, background: 'rgba(7, 10, 18, 0.6)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', zIndex: 9999, opacity: isExpanded ? 1 : 0, transition: 'opacity 0.25s ease' }}>
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'fixed',
              top: isExpanded ? '50%' : `${originRect.top + originRect.height / 2}px`,
              left: isExpanded ? '50%' : `${originRect.left + originRect.width / 2}px`,
              width: isExpanded ? '880px' : `${originRect.width}px`,
              height: isExpanded ? '560px' : `${originRect.height}px`,
              transform: isExpanded ? 'translate(-50%, -50%) scale(1)' : 'translate(-50%, -50%) scale(0.85)',
              background: 'rgba(17, 24, 39, 0.98)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '28px',
              padding: isExpanded ? '36px' : '20px',
              boxShadow: '0 50px 100px rgba(0,0,0,0.7)',
              transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
              opacity: isExpanded ? 1 : 0,
              boxSizing: 'border-box',
              overflow: 'hidden',
              display: 'flex',
              gap: '36px'
            }}
          >
            {isExpanded && (
              <>
                {/* LEFT CONFIGURATION MODULE */}
                <div style={{ flex: '1 1 42%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderRight: '1px solid rgba(255,255,255,0.06)', paddingRight: '32px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div>
                      <span style={subTitleTextStyle}>METADATA FLOW NODE</span>
                      <h2 style={{ fontSize: '1.6rem', fontWeight: '700', color: '#ffffff', margin: '4px 0 0 0', letterSpacing: '-0.02em' }}>
                        Modify Category
                      </h2>
                    </div>

                    <div>
                      <label style={labelStyle}>Category Name</label>
                      <input 
                        value={editName} 
                        onChange={(e) => setEditName(e.target.value)} 
                        style={inputStyle} 
                        disabled={systemDefaults.includes(selectedCategory.name.toLowerCase())}
                      />
                    </div>

                    <div>
                      <label style={labelStyle}>Accent Color</label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div style={{ width: '44px', height: '44px', borderRadius: '50%', overflow: 'hidden', position: 'relative', background: editColor, border: '1px solid rgba(255,255,255,0.15)' }}>
                          <input type="color" value={editColor} onChange={(e) => setEditColor(e.target.value)} style={nativeColorInputHiddenStyle} />
                        </div>
                        <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontFamily: 'monospace' }}>{editColor.toUpperCase()}</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '14px', marginTop: '20px' }}>
                    {!systemDefaults.includes(selectedCategory.name.toLowerCase()) && (
                      <button onClick={(e) => triggerDeleteWorkflow(selectedCategory, e)} style={dangerBtnStyle}>Delete Category</button>
                    )}
                    <button onClick={handleSaveCategoryEdits} style={saveBtnStyle}>Save Changes</button>
                  </div>
                </div>

                {/* RIGHT ASSIGNED TASKS LIST */}
                <div style={{ flex: '1 1 58%', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div>
                    <label style={labelStyle}>Assigned Tasks ({filteredTasks.length})</label>
                    <p style={{ margin: '2px 0 0 0', fontSize: '0.85rem', color: '#64748b' }}>Click a task to edit its parameters.</p>
                  </div>

                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto', paddingRight: '6px' }}>
                    {filteredTasks.length === 0 ? (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', border: '2px dashed rgba(255,255,255,0.03)', borderRadius: '16px' }}>
                        <p style={{ fontSize: '0.9rem', color: '#475569' }}>No tasks assigned to this category.</p>
                      </div>
                    ) : (
                      filteredTasks.map(task => (
                        <div 
                          key={task.id}
                          onClick={() => openNestedTaskEdit(task)}
                          style={nestedTaskItemStyle}
                          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.01)'}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: task.status === 'Completed' ? '#10b981' : '#3b82f6' }} />
                            <span style={{ fontSize: '0.92rem', color: task.status === 'Completed' ? '#475569' : '#ffffff', textDecoration: task.status === 'Completed' ? 'line-through' : 'none', fontWeight: '500' }}>
                              {task.title}
                            </span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontSize: '0.7rem', padding: '3px 8px', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', color: task.priority === 'High' ? '#ef4444' : '#3b82f6', fontWeight: '600' }}>
                              {task.priority}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* CLEAN STRATEGY SELECTION DELETION DIALOG */}
      {deleteTarget && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(3, 7, 18, 0.65)', backdropFilter: 'blur(30px)', WebkitBackdropFilter: 'blur(30px)', zIndex: 1000000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: '480px', background: '#111827', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '24px', padding: '32px', boxShadow: '0 40px 80px rgba(0,0,0,0.95)', display: 'flex', flexDirection: 'column', gap: '22px' }}>
            <div>
              <span style={{ ...subTitleTextStyle, color: '#ef4444' }}>SYSTEM WARNING</span>
              <h3 style={{ margin: '4px 0 0 0', fontSize: '1.4rem', fontWeight: '700', color: '#ffffff', letterSpacing: '-0.01em' }}>
                Delete "{deleteTarget.name}"?
              </h3>
              <p style={{ margin: '8px 0 0 0', fontSize: '0.88rem', color: '#94a3b8', lineHeight: '1.5' }}>
                What should happen to the tasks assigned to this category?
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button 
                onClick={() => commitDeletionStrategy('just_category')}
                style={deletionStrategyOptionButtonStyle}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{ textAlign: 'left' }}>
                  <strong style={{ display: 'block', color: '#38bdf8', fontSize: '0.9rem' }}>Keep Tasks</strong>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Move remaining tasks back to "General".</span>
                </div>
              </button>

              <button 
                onClick={() => commitDeletionStrategy('category_and_tasks')}
                style={deletionStrategyOptionButtonStyle}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239,68,68,0.05)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{ textAlign: 'left' }}>
                  <strong style={{ display: 'block', color: '#ef4444', fontSize: '0.9rem' }}>Delete Category and All Tasks</strong>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Permanently remove this category and all its tasks.</span>
                </div>
              </button>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '6px' }}>
              <button 
                onClick={() => setDeleteTarget(null)} 
                style={{ ...dangerBtnStyle, background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.08)', color: '#94a3b8' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NESTED TASK ACTION PANEL */}
      {activeTaskToEdit && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(7, 10, 18, 0.45)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', zIndex: 100000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: '460px', background: 'rgba(20, 26, 43, 0.95)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '28px', padding: '32px', boxShadow: '0 50px 100px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', gap: '18px', boxSizing: 'border-box' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <h2 style={{ fontSize: '1.45rem', fontWeight: '700', color: '#ffffff', margin: 0, letterSpacing: '-0.02em' }}>
                Modify Task Flow
              </h2>

              <div>
                <label style={labelStyle}>Task Title</label>
                <input value={editTaskTitle} onChange={(e) => setEditTaskTitle(e.target.value)} style={inputStyle} />
              </div>

              <div>
                <label style={labelStyle}>Priority Tier</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  {['Low', 'Medium', 'High'].map((p) => {
                    const isSelected = editTaskPriority === p;
                    const cfg = priorityConfig[p];
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setEditTaskPriority(p)}
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
                  <label style={labelStyle}>Category Target</label>
                  <select value={editTaskCategory} onChange={(e) => setEditTaskCategory(e.target.value)} style={inputStyle}>
                    {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                  </select>
                </div>

                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Status State</label>
                  <select value={editTaskStatus} onChange={(e) => setEditTaskStatus(e.target.value)} style={inputStyle}>
                    <option value="To Do">To Do</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '14px' }}>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Due Date</label>
                  <input type="date" value={editTaskDueDate} onChange={(e) => setEditTaskDueDate(e.target.value)} style={inputStyle} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Specific Time</label>
                  <input type="time" value={editTaskDueTime} onChange={(e) => setEditTaskDueTime(e.target.value)} style={inputStyle} />
                </div>
              </div>

              <div style={{ display: 'flex', justifycontent: 'space-between', alignItems: 'center', background: 'rgba(15,23,42,0.3)', padding: '14px 18px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.04)' }}>
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: '0.9rem', fontWeight: '600', color: '#ffffff', display: 'block' }}>Repeat Flow Everyday</span>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Runs infinitely until disabled</span>
                </div>
                <div 
                  onClick={() => setEditTaskRepeat(!editTaskRepeat)}
                  style={{ width: '50px', height: '28px', background: editTaskRepeat ? '#a855f7' : 'rgba(255,255,255,0.1)', borderRadius: '99px', position: 'relative', cursor: 'pointer', transition: 'background 0.25s ease' }}
                >
                  <div style={{ width: '22px', height: '22px', background: '#ffffff', borderRadius: '50%', position: 'absolute', top: '3px', left: editTaskRepeat ? '25px' : '3px', boxShadow: '0 2px 4px rgba(0,0,0,0.4)', transition: 'left 0.25s cubic-bezier(0.25, 1, 0.5, 1)' }} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                <button onClick={() => handleNestedTaskDelete(activeTaskToEdit.id)} style={dangerBtnStyle}>Delete Task</button>
                <button onClick={handleSaveNestedTask} style={saveBtnStyle}>Save Actions</button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// INLINE STYLING SYSTEM
const pageContainerStyle = { width: '100%', maxWidth: '1080px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px', paddingTop: '40px' };
const headerTextWrapperStyle = { textAlign: 'center', marginBottom: '8px' };
const mainTitleTextStyle = { margin: '0 0 12px 0', fontSize: '2.5rem', fontWeight: '700', color: '#ffffff', letterSpacing: '-0.02em' };
const subTitleTextStyle = { margin: 0, fontSize: '0.72rem', fontWeight: '800', color: '#4f5e75', letterSpacing: '0.06em', textTransform: 'uppercase' };
const formPanelStyle = { padding: '12px 24px', borderRadius: '24px', background: 'rgba(30, 41, 59, 0.4)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', border: '1px solid rgba(255, 255, 255, 0.05)', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)', transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)' };
const formInlineStyle = { display: 'flex', gap: '18px', alignItems: 'center', width: '100%' };
const inputFieldStyle = { flex: 1, padding: '16px 0px', borderRadius: '0px', border: 'none', background: 'transparent', color: '#ffffff', fontSize: '1.05rem', outline: 'none' };
const colorCircleWrapperStyle = { width: '36px', height: '36px', borderRadius: '50%', overflow: 'hidden', cursor: 'pointer', border: 'none', flexShrink: 0, position: 'relative' };
const nativeColorInputHiddenStyle = { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none', background: 'transparent', cursor: 'pointer', padding: 0, opacity: 0, zIndex: 2 };
const submitButtonStyle = { width: '36px', height: '36px', borderRadius: '14px', border: 'none', background: 'linear-gradient(135deg, #a855f7 0%, #6b21a8 100%)', color: 'white', fontSize: '1.4rem', fontWeight: '400', cursor: 'pointer', boxShadow: '0 4px 14px rgba(168, 85, 247, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 };
const gridContainerStyle = { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '32px', width: '100%' };
const cardStyle = { display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '24px', borderRadius: '24px', background: 'rgba(30, 41, 59, 0.4)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', border: '1px solid rgba(255, 255, 255, 0.05)', minHeight: '120px', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)', transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)', cursor: 'pointer' };
const cardCrossDeleteButtonStyle = { background: 'transparent', border: 'none', color: '#475569', fontSize: '0.95rem', cursor: 'pointer', padding: '4px', transition: 'color 0.2s' };
const lockBadgeStyle = { fontSize: '0.68rem', fontWeight: '800', padding: '3px 9px', borderRadius: '999px', border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)', color: '#475569' };
const labelStyle = { display: 'block', fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase', color: '#475569', marginBottom: '6px', letterSpacing: '0.04em' };
const inputStyle = { width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(15, 23, 42, 0.45)', color: '#ffffff', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' };
const dangerBtnStyle = { flex: 1, padding: '14px', borderRadius: '14px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#ef4444', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s' };
const saveBtnStyle = { flex: 1, padding: '14px', borderRadius: '14px', background: 'linear-gradient(135deg, #a855f7 0%, #6b21a8 100%)', border: 'none', color: '#ffffff', fontWeight: '600', cursor: 'pointer', boxShadow: '0 4px 15px rgba(168, 85, 247, 0.25)' };
const nestedTaskItemStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '14px', cursor: 'pointer', transition: 'background 0.2s' };
const deletionStrategyOptionButtonStyle = { width: '100%', background: 'transparent', border: '1px solid rgba(255,255,255,0.06)', padding: '16px 20px', borderRadius: '16px', cursor: 'pointer', transition: 'all 0.2s', boxSizing: 'border-box' };