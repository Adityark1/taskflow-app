import { useState } from 'react';

export default function TaskForm({ onTaskAdded }) {
  const [title, setTitle] = useState('');

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

  const formatted =
    transcript.charAt(0).toUpperCase() + transcript.slice(1);

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
      await fetch('http://localhost:4000/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title }),
      });

      setTitle('');

      if (onTaskAdded) {
        onTaskAdded();
      }
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: 'flex',
        gap: '12px',
        alignItems: 'center',
      }}
    >
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="What needs to be done?"
        required
        style={{
          flex: 1,
          padding: '18px 24px',
          borderRadius: '20px',
          border: '1px solid #334155',
          background: '#111827',
          color: 'white',
          fontSize: '1rem',
          outline: 'none',
        }}
      />

      <button
        type="button"
        onClick={startListening}
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '18px',
          border: 'none',
          background: '#1e293b',
          color: 'white',
          fontSize: '1.4rem',
          cursor: 'pointer',
        }}
      >
        🎤
      </button>

      <button
        type="submit"
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '18px',
          border: 'none',
          background: '#3b82f6',
          color: 'white',
          fontSize: '1.4rem',
          cursor: 'pointer',
          fontWeight: 'bold',
        }}
      >
        +
      </button>
    </form>
  );
}