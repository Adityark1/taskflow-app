// 1. ADD AT THE VERY TOP: Tells Node to look inside your hidden .env file for the Groq API Key
require('dotenv').config();

const express = require('express');
const cors = require('cors');

const tasksRouter = require('./routes/tasks');
const categoriesRouter = require('./routes/categories'); 
const profileRouter = require('./routes/profile'); 
const aiCommandRouter = require('./routes/aiCommand');

// 🔌 ADD THIS: Import your dashboard metrics router
const dashboardRouter = require('./routes/dashboard'); 

// FIXED: Pointing exactly to your folder structure
const db = require('./db/database'); 

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('TaskFlow API Running');
});

app.use('/api/tasks', tasksRouter);
app.use('/api/categories', categoriesRouter); 
app.use('/api/profile', profileRouter); 
app.use('/api/ai-command', aiCommandRouter); 

// 🚀 ADD THIS: Mount the dashboard analytics gateway to match your React fetch request
app.use('/api/dashboard', dashboardRouter); 

const PORT = 4000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});