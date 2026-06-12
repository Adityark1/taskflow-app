import { useState } from 'react';

export default function AiFloatingWidget({ onRefreshDashboard }) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [chatLog, setChatLog] = useState([
    { sender: 'ai', text: '✨ TaskFlow AI initialized. Command me by typing or tapping the mic.' }
  ]);
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);

  let recognition = null;
  if (typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition)) {
    const SpeechConstructor = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechConstructor();
    recognition.continuous = false;
    recognition.lang = 'en-US';
  }

  const handleVoiceInput = () => {
    if (!recognition) {
      alert("Voice parsing is not supported on this specific web browser engine.");
      return;
    }
    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      setIsListening(true);
      recognition.start();

      recognition.onresult = (event) => {
        const voiceText = event.results[0][0].transcript;
        setInputMessage(voiceText);
        setIsListening(false);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
    }
  };

 const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userText = inputMessage.trim();
    setInputMessage('');
    setChatLog((prev) => [...prev, { sender: 'user', text: userText }]);
    setLoading(true);

    try {
      // 🚀 FIXED: Hyphen added, and /execute path stripped to target the root router handler accurately
      const response = await fetch('http://localhost:4000/api/ai-command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userText }),
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP status ${response.status}`);
      }

      const data = await response.json();
      const systemReply = data.reply || '✨ Vector adjustments compiled successfully.';
      setChatLog((prev) => [...prev, { sender: 'ai', text: systemReply }]);

      // 🚀 ADVANCED REAL-TIME DISPATCH ENGINE FOR INSTANT ELEMENT INJECTION
      if (data && data.action) {
        if (onRefreshDashboard) onRefreshDashboard();

        const updateEvent = new CustomEvent('taskflow-db-update', { 
          detail: { 
            action: data.action,
            task: data.task,          // Packs full raw updated/created task data rows
            category: data.category,  // Packs full raw category structural changes
            taskId: data.taskId       // Packs target drop identities for immediate deletions
          } 
        });
        window.dispatchEvent(updateEvent);
      }

    } catch (error) {
      console.error('Core AI Transmission Error:', error);
      setChatLog((prev) => [...prev, { sender: 'ai', text: `❌ Disruption establishing synchronization hook: ${error.message}` }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* MINIMALIST PREMIUM GLOWING AI TRIGGER BUTTON */}
      <button 
        onClick={() => setIsOpen(true)}
        style={{
          position: 'fixed', bottom: '35px', right: '35px',
          background: 'linear-gradient(135deg, #a855f7 0%, #4f46e5 100%)',
          color: '#ffffff', border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '20px', padding: '12px 20px',
          fontSize: '0.85rem', fontWeight: '800', letterSpacing: '0.1em',
          cursor: 'pointer', zIndex: 9999,
          fontFamily: 'system-ui, sans-serif',
          boxShadow: '0 12px 40px rgba(79, 70, 229, 0.3)',
          transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-4px) scale(1.05)';
          e.currentTarget.style.boxShadow = '0 0 25px 6px rgba(168, 85, 247, 0.5), 0 20px 40px rgba(79, 70, 229, 0.4)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0) scale(1)';
          e.currentTarget.style.boxShadow = '0 12px 40px rgba(79, 70, 229, 0.3)';
        }}
        onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.92)'; }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '0.95rem' }}>✦</span> AI
        </span>
      </button>

      {/* FLYOUT GLASSMORPHIC CHAT PANEL */}
      <div style={{
        position: 'fixed', top: 0, right: 0, height: '100vh', width: '400px', 
        background: 'rgba(10, 15, 30, 0.75)', backdropFilter: 'blur(40px)', WebkitBackdropFilter: 'blur(40px)',
        borderLeft: '1px solid rgba(255, 255, 255, 0.08)', zIndex: 10000, 
        display: 'flex', flexDirection: 'column', boxShadow: '-30px 0 60px rgba(0, 0, 0, 0.6)',
        transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
        opacity: isOpen ? 1 : 0, visibility: isOpen ? 'visible' : 'hidden',
        transition: 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.4s ease',
      }}>
        {/* Header Section */}
        <div style={{ padding: '24px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ color: '#ffffff', fontSize: '1.1rem', fontWeight: '800', margin: 0, letterSpacing: '-0.02em' }}>TaskFlow Core AI</h3>
            <p style={{ color: '#64748b', fontSize: '0.75rem', margin: '4px 0 0 0', fontWeight: '500' }}>Llama-3.3 Processing Network active</p>
          </div>
          <button onClick={() => setIsOpen(false)} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: '#94a3b8', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700' }}>×</button>
        </div>

        {/* Message Log Logs Container */}
        <div style={{ flex: 1, padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {chatLog.map((chat, idx) => (
            <div key={idx} style={{
              alignSelf: chat.sender === 'user' ? 'flex-end' : 'flex-start',
              background: chat.sender === 'user' ? 'linear-gradient(135deg, #a855f7 0%, #6366f1 100%)' : 'rgba(255,255,255,0.04)',
              border: chat.sender === 'user' ? 'none' : '1px solid rgba(255,255,255,0.03)',
              color: '#ffffff', padding: '12px 18px', borderRadius: '16px', maxWidth: '85%', fontSize: '0.9rem',
              lineHeight: '1.4'
            }}>
              {chat.text}
            </div>
          ))}
          {loading && <div style={{ color: '#a855f7', fontSize: '0.85rem', fontWeight: '600', paddingLeft: '4px' }}>⚡ Processing intent vectors...</div>}
        </div>

        {/* Input Form Controls Layout */}
        <form onSubmit={handleSendMessage} style={{ padding: '24px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: '12px', background: 'rgba(10,15,30,0.4)' }}>
          <button 
            type="button" 
            onClick={handleVoiceInput} 
            style={{ 
              background: isListening ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255,255,255,0.04)', 
              border: isListening ? '1px solid #ef4444' : '1px solid rgba(255,255,255,0.08)', 
              borderRadius: '14px', width: '48px', height: '48px', cursor: 'pointer', fontSize: '1.1rem',
              transition: 'all 0.2s ease', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
          >
            {isListening ? '🛑' : '🎤'}
          </button>
          <input 
            type="text"     
            value={inputMessage} 
            onChange={(e) => setInputMessage(e.target.value)} 
            placeholder="Command task engine..." 
            style={{ 
              flex: 1, background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255,255,255,0.08)', 
              borderRadius: '14px', padding: '0 18px', color: '#ffffff', outline: 'none', fontSize: '0.9rem',
              transition: 'all 0.2s ease'
            }} 
            onFocus={(e) => e.target.style.borderColor = 'rgba(168, 85, 247, 0.4)'}
            onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
          />
          <button type="submit" style={{ background: '#ffffff', color: '#0f172a', border: 'none', borderRadius: '14px', padding: '0 22px', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer' }}>Send</button>
        </form>
      </div>
    </>
  );
}