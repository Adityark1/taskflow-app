const express = require('express');
const cors = require('cors');

const tasksRouter = require('./routes/tasks');
const categoriesRouter = require('./routes/categories'); 
const profileRouter = require('./routes/profile'); 

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

const PORT = 4000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});