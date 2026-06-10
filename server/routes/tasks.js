// server/routes/tasks.js

/* MIGRATION:
CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'To Do',
    priority TEXT DEFAULT 'Medium',
    due_date DATE
);
*/

const express = require('express');
const router = express.Router();
const db = require('../db/database');

// GET all tasks
router.get('/', (req, res) => {
    try {
        const tasks = db.prepare('SELECT * FROM tasks').all();
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST a new task
router.post('/', (req, res) => {
    const { title, description, status, priority, due_date } = req.body;
    try {
        const stmt = db.prepare('INSERT INTO tasks (title, description, status, priority, due_date) VALUES (?, ?, ?, ?, ?)');
        const info = stmt.run(title, description, status || 'To Do', priority || 'Medium', due_date);
        res.status(201).json({ id: info.lastInsertRowid });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router; // Required for server.js to work!