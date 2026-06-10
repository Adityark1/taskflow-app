const express = require('express');
const cors = require('cors');

const tasksRouter = require('./routes/tasks');
const categoriesRouter = require('./routes/categories');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('TaskFlow API Running');
});

app.use('/api/tasks', tasksRouter);
app.use('/api/categories', categoriesRouter);

const PORT = 4000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});