import { useState, useRef, useEffect } from 'react';

export default function TaskForm({ onTaskAdded }) {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [category, setCategory] = useState('General');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const startListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.start();

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript.trim();
      const formatted = transcript.charAt(0).toUpperCase() + transcript.slice(1);
      setTitle(formatted);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      const res = await fetch('http://localhost:4000/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title.trim(),
          priority: priority,
          category: category,
        }),
      });

      if (!res.ok) {
        throw new Error(`Server responded with ${res.status}`);
      }

      setTitle('');
      if (onTaskAdded) {
        onTaskAdded();
      }
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const priorityConfig = {
    Low: { color: '#10b981' },
    Medium: { color: '#3b82f6' },
    High: { color: '#ef4444' },
  };

  const categoriesList = ['General', 'Work', 'Personal', 'Health'];

  return (
    <form 
      onSubmit={handleSubmit} 
      style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '22px', 
        width: '100%',
        position: 'relative',
        /* CRITICAL VISUAL FIXES:
          1. Dynamic padding-bottom pushes the task list grid down smoothly when open.
          2. Elevating the z-index tells the browser to render the entire form block on top of the task list layer.
        */
        paddingBottom: isDropdownOpen ? '160px' : '0px',
        zIndex: isDropdownOpen ? 500 : 10,
        transition: 'padding-bottom 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
      }}
    >
      
      {/* PRIMARY TASK TEXT INPUT ROW */}
      <div style={{ display: 'flex', gap: '14px', alignItems: 'center', width: '100%' }}>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What needs to be done today?"
          required
          style={{
            flex: 1,
            padding: '18px 24px',
            borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            background: 'rgba(15, 23, 42, 0.6)',
            color: '#ffffff',
            fontSize: '1.05rem',
            outline: 'none',
            boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.3)',
            transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = 'rgba(168, 85, 247, 0.4)';
            e.currentTarget.style.boxShadow = 'inset 0 2px 4px rgba(0,0,0,0.3), 0 0 20px rgba(168, 85, 247, 0.15)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)';
            e.currentTarget.style.boxShadow = 'inset 0 2px 4px rgba(0, 0, 0, 0.3)';
          }}
        />

        <button
          type="button"
          onClick={startListening}
          style={{
            padding: '0 22px',
            height: '58px',
            borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            background: 'rgba(255, 255, 255, 0.03)',
            color: '#94a3b8',
            cursor: 'pointer',
            fontSize: '0.95rem',
            fontWeight: '600',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
            e.currentTarget.style.color = '#ffffff';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
            e.currentTarget.style.color = '#94a3b8';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          Voice
        </button>

        <button
          type="submit"
          style={{
            width: '58px',
            height: '58px',
            borderRadius: '16px',
            border: 'none',
            background: 'linear-gradient(135deg, #a855f7 0%, #6b21a8 100%)',
            color: 'white',
            fontSize: '1.8rem',
            fontWeight: '300',
            cursor: 'pointer',
            boxShadow: '0 8px 24px rgba(168, 85, 247, 0.35)',
            transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px) scale(1.03)';
            e.currentTarget.style.boxShadow = '0 12px 28px rgba(168, 85, 247, 0.45)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0) scale(1)';
            e.currentTarget.style.boxShadow = '0 8px 24px rgba(168, 85, 247, 0.35)';
          }}
        >
          +
        </button>
      </div>

      {/* METADATA CONFIGURATION ROW */}
      <div style={{ display: 'flex', gap: '48px', alignItems: 'center' }}>
        
        {/* PRIORITY SELECTION COMPONENT */}
        <div>
          <p style={metaTitleStyle}>Priority Tier</p>
          <div style={{ display: 'flex', gap: '10px' }}>
            {['Low', 'Medium', 'High'].map((p) => {
              const isSelected = priority === p;
              const cfg = priorityConfig[p];
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  style={{
                    padding: '8px 20px',
                    borderRadius: '999px',
                    border: isSelected ? `1px solid ${cfg.color}` : '1px solid rgba(255, 255, 255, 0.04)',
                    background: isSelected ? `linear-gradient(135deg, ${cfg.color}dd 0%, ${cfg.color}ff 100%)` : `${cfg.color}10`,
                    color: isSelected ? '#ffffff' : cfg.color,
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    fontWeight: '700',
                    letterSpacing: '0.01em',
                    boxShadow: isSelected ? `0 6px 15px ${cfg.color}30` : 'none',
                    transform: isSelected ? 'scale(1.04)' : 'scale(1)',
                    transition: 'all 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.1)'
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.background = `${cfg.color}20`;
                      e.currentTarget.style.transform = 'translateY(-1px)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.background = `${cfg.color}10`;
                      e.currentTarget.style.transform = 'translateY(0)';
                    }
                  }}
                >
                  {p}
                </button>
              );
            })}
          </div>
        </div>

        {/* CUSTOM TRANSLUCENT FLOATING DROPDOWN MENU */}
        <div ref={dropdownRef} style={{ position: 'relative' }}>
          <p style={metaTitleStyle}>Category</p>
          
          {/* THE SELECTION TRIGGER TRACK */}
          <div
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            style={{
              padding: '10px 20px',
              width: '150px',
              borderRadius: '14px',
              border: isDropdownOpen ? '1px solid rgba(168, 85, 247, 0.4)' : '1px solid rgba(255, 255, 255, 0.06)',
              background: 'rgba(15, 23, 42, 0.45)',
              color: '#ffffff',
              fontSize: '0.85rem',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: isDropdownOpen ? '0 0 15px rgba(168, 85, 247, 0.1)' : 'none',
              transition: 'all 0.25s ease'
            }}
            onMouseEnter={(e) => {
              if(!isDropdownOpen) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
            }}
            onMouseLeave={(e) => {
              if(!isDropdownOpen) e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.06)';
            }}
          >
            <span>{category}</span>
            <span 
              style={{ 
                fontSize: '0.65rem', 
                color: '#64748b',
                transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
              }}
            >
              ▼
            </span>
          </div>

          {/* FLOATING LIST OPTIONS TRAY */}
          <div
            style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              left: 0,
              width: '180px',
              background: 'rgba(20, 26, 46, 0.98)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '14px',
              padding: '6px',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)',
              /* Elevated index ensures options display on top of anything underneath */
              zIndex: 1000,
              display: 'flex',
              flexDirection: 'column',
              gap: '2px',
              
              opacity: isDropdownOpen ? 1 : 0,
              transform: isDropdownOpen ? 'translateY(0) scale(1)' : 'translateY(-6px) scale(0.96)',
              pointerEvents: isDropdownOpen ? 'auto' : 'none',
              transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
          >
            {categoriesList.map((cat) => {
              const isActive = category === cat;
              return (
                <div
                  key={cat}
                  onClick={() => {
                    setCategory(cat);
                    setIsDropdownOpen(false);
                  }}
                  style={{
                    padding: '10px 14px',
                    borderRadius: '10px',
                    color: isActive ? '#c084fc' : '#94a3b8',
                    background: isActive ? 'rgba(168, 85, 247, 0.12)' : 'transparent',
                    fontSize: '0.85rem',
                    fontWeight: isActive ? '700' : '500',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#ffffff';
                    e.currentTarget.style.background = isActive ? 'rgba(168, 85, 247, 0.16)' : 'rgba(255, 255, 255, 0.04)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = isActive ? '#c084fc' : '#94a3b8';
                    e.currentTarget.style.background = isActive ? 'rgba(168, 85, 247, 0.12)' : 'transparent';
                  }}
                >
                  {cat}
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </form>
  );
}

const metaTitleStyle = { 
  color: '#475569', 
  marginBottom: '10px', 
  fontSize: '0.72rem', 
  fontWeight: '800', 
  textTransform: 'uppercase', 
  letterSpacing: '0.08em' 
};