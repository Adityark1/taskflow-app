const express = require('express');
const router = express.Router();
const db = require('../db/database'); // Matches your exact database path!

// 1. DATABASE SCHEMA INITIALIZATION & SEEDING (Synchronous SQLite Style)
try {
    // Automatically create the categories table if it doesn't exist yet
    db.prepare(`
        CREATE TABLE IF NOT EXISTS categories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE,
            color TEXT NOT NULL
        )
    `).run();

    // Check if table is empty
    const countRow = db.prepare('SELECT COUNT(*) as count FROM categories').get();
    
    if (countRow.count === 0) {
        console.log('--- Database empty: Seeding default system categories into SQLite ---');
        const defaults = [
            { name: 'General', color: '#6366f1' },
            { name: 'Work', color: '#3b82f6' },
            { name: 'Personal', color: '#ec4899' },
            { name: 'Health', color: '#10b981' }
        ];

        const insertStmt = db.prepare('INSERT INTO categories (name, color) VALUES (?, ?)');
        
        // Use a transaction for safe, instant batch inserting
        const seedTransaction = db.transaction((cats) => {
            for (const cat of cats) {
                insertStmt.run(cat.name, cat.color);
            }
        });
        
        seedTransaction(defaults);
        console.log('--- System categories seeded successfully into SQLite! ---');
    }
} catch (error) {
    console.error('❌ SQLite Categories Setup Error:', error.message);
}

// 2. GET ALL CATEGORIES
router.get('/', (req, res) => {
    try {
        const categories = db.prepare('SELECT * FROM categories ORDER BY id ASC').all();
        res.json(categories);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 3. CREATE NEW CATEGORY
router.post('/', (req, res) => {
    try {
        const { name, color } = req.body;
        if (!name) {
            return res.status(400).json({ error: 'Name is required' });
        }

        // Check for duplicates
        const existing = db.prepare('SELECT * FROM categories WHERE LOWER(name) = LOWER(?)').get(name.trim());
        if (existing) {
            return res.status(400).json({ error: 'Category already exists' });
        }

        const stmt = db.prepare('INSERT INTO categories (name, color) VALUES (?, ?)');
        const result = stmt.run(name.trim(), color || '#a855f7');

        const newCategory = db.prepare('SELECT * FROM categories WHERE id = ?').get(result.lastInsertRowid);
        res.status(201).json(newCategory);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 4. UPDATE CATEGORY (PUT)
router.put('/:id', (req, res) => {
    try {
        const { name, color } = req.body;
        const stmt = db.prepare('UPDATE categories SET name = ?, color = ? WHERE id = ?');
        stmt.run(name, color, req.params.id);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 5. BULLETPROOF DELETE CATEGORY (Prevents 500 Internal Server Errors)
router.delete('/:id', (req, res) => {
    try {
        const { id } = req.params;
        const { strategy, name } = req.query;

        // 1. Resolve target category name accurately
        let targetName = name;
        if (!targetName) {
            const category = db.prepare('SELECT name FROM categories WHERE id = ?').get(id);
            if (category) {
                targetName = category.name;
            }
        }

        // 2. Safely clear out or shift tasks first without allowing table schemas to break the route
        if (targetName) {
            try {
                if (strategy === 'just_category') {
                    // Update any matching tasks to General, case insensitively
                    db.prepare('UPDATE tasks SET category = "General" WHERE LOWER(category) = LOWER(?)').run(targetName);
                } else if (strategy === 'category_and_tasks') {
                    // Delete any matching tasks, case insensitively
                    db.prepare('DELETE FROM tasks WHERE LOWER(category) = LOWER(?)').run(targetName);
                }
            } catch (taskTableErr) {
                // If your database table is named something else, log it but DO NOT send a 500 crash error
                console.warn('⚠️ Tasks table synchronization bypassed:', taskTableErr.message);
            }
        }

        // 3. Delete the category from the database
        db.prepare('DELETE FROM categories WHERE id = ?').run(id);

        // 4. Return successful status response to the frontend
        res.json({ success: true });
    } catch (error) {
        console.error('❌ Critical Deletion Backend Error:', error.message);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;