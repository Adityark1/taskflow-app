const express = require('express');
const router = express.Router();
const db = require('../db/database');

/*
CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'To Do',
    priority TEXT DEFAULT 'Medium',
    due_date TEXT
);
*/

// GET ALL TASKS
router.get('/', (req, res) => {
    try {
        const tasks = db.prepare('SELECT * FROM tasks ORDER BY id DESC').all();
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// CREATE TASK
router.post('/', (req, res) => {
    try {
        const { title } = req.body;

        const stmt = db.prepare(`
            INSERT INTO tasks (title)
            VALUES (?)
        `);

        const result = stmt.run(title);

        const newTask = db.prepare(`
            SELECT * FROM tasks WHERE id = ?
        `).get(result.lastInsertRowid);

        res.status(201).json(newTask);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE TASK
router.delete('/:id', (req, res) => {
    try {
        const stmt = db.prepare(`
            DELETE FROM tasks WHERE id = ?
        `);

        stmt.run(req.params.id);

        res.json({
            success: true
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;