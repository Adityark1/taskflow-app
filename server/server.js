const express = require('express');
const cors = require('cors');

const tasksRouter = require('./routes/tasks');
const categoriesRouter = require('./routes/categories'); // 1. Import the new router

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('TaskFlow API Running');
});

app.use('/api/tasks', tasksRouter);
app.use('/api/categories', categoriesRouter); // 2. Mount it to /api/categories

const PORT = 4000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});