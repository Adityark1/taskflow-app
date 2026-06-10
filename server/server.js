// server/server.js
const express = require('express');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Root route
app.get('/', (req, res) => {
  res.send('TaskFlow API Running');
});

// Task routes
app.get('/api/tasks', (req, res) => {
  // Placeholder data
  res.json([
    { id: 1, title: 'Learn React', status: 'Pending' },
    { id: 2, title: 'Build Full Stack App', status: 'In Progress' }
  ]);
});

app.post('/api/tasks', (req, res) => {
  const newTask = req.body;
  console.log('Task received:', newTask);
  res.status(201).json({ message: 'Task added successfully', task: newTask });
});

// Start server
const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});