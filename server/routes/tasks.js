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

// CREATE TASK WITH METADATA (Perfect alignment with your new schema!)
router.post('/', (req, res) => {
    try {
        const { title, priority, category } = req.body;

        if (!title) {
            return res.status(400).json({ error: 'Title is required' });
        }

        // Silent backend fallbacks for the extra columns
        const description = '';
        const status = 'To Do';
        const finalPriority = priority || 'Medium';
        const finalCategory = category || 'General';
        const due_date = '';
        const due_time = '';
        const repeat_daily = 0;

        const stmt = db.prepare(`
            INSERT INTO tasks (title, description, status, priority, category, due_date, due_time, repeat_daily)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `);

        const result = stmt.run(
            title.trim(),
            description,
            status,
            finalPriority,
            finalCategory,
            due_date,
            due_time,
            repeat_daily
        );

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
        const { title, status, priority, category, due_date, due_time, repeat_daily, description } = req.body;
        
        const stmt = db.prepare(`
            UPDATE tasks 
            SET title = ?, description = ?, status = ?, priority = ?, category = ?, due_date = ?, due_time = ?, repeat_daily = ?
            WHERE id = ?
        `);

        stmt.run(
            title, 
            description || '',
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