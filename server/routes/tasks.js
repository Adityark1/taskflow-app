const express = require('express');
const router = express.Router();
const db = require('../db/database');

// GET ALL TASKS
router.get('/', (req, res) => {
    try {
        const tasks = db.prepare('SELECT * FROM tasks ORDER BY id DESC').all();
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// CREATE TASK WITH METADATA (Hooked up to your TaskForm!)
router.post('/', (req, res) => {
    try {
        const { title, priority, category } = req.body;

        const stmt = db.prepare(`
            INSERT INTO tasks (title, priority, category)
            VALUES (?, ?, ?)
        `);

        const result = stmt.run(title, priority || 'Medium', category || 'General');

        const newTask = db.prepare(`
            SELECT * FROM tasks WHERE id = ?
        `).get(result.lastInsertRowid);

        res.status(201).json(newTask);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// UPDATE TASK FLOW (Hooked up to your TaskList advanced modal!)
router.patch('/:id', (req, res) => {
    try {
        const { title, status, priority, category, due_date, due_time, repeat_daily } = req.body;
        
        const stmt = db.prepare(`
            UPDATE tasks 
            SET title = ?, status = ?, priority = ?, category = ?, due_date = ?, due_time = ?, repeat_daily = ?
            WHERE id = ?
        `);

        stmt.run(
            title, 
            status, 
            priority, 
            category, 
            due_date, 
            due_time, 
            repeat_daily ? 1 : 0, 
            req.params.id
        );

        res.json({ success: true });
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
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;