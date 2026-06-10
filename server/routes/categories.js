const express = require('express');
const router = express.Router();
const db = require('../db/database');

// Create default categories if none exist
const count = db
  .prepare('SELECT COUNT(*) as count FROM categories')
  .get();

if (count.count === 0) {
  const stmt = db.prepare(
    'INSERT INTO categories (name, color, is_default) VALUES (?, ?, ?)'
  );

  stmt.run('Productivity', '#8b5cf6', 1);
  stmt.run('Personal', '#3b82f6', 1);
  stmt.run('Finance', '#22c55e', 1);
  stmt.run('Social', '#f97316', 1);
}

// GET all categories
router.get('/', (req, res) => {
  try {
    const categories = db
      .prepare('SELECT * FROM categories ORDER BY is_default DESC, name ASC')
      .all();

    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// CREATE category
router.post('/', (req, res) => {
  const { name, color } = req.body;

  try {
    const stmt = db.prepare(
      `
      INSERT INTO categories
      (name, color, is_default)
      VALUES (?, ?, 0)
    `
    );

    const result = stmt.run(
      name,
      color || '#3b82f6'
    );

    res.status(201).json({
      id: result.lastInsertRowid,
    });
  } catch (error) {
    res.status(400).json({
      error: error.message,
    });
  }
});

// DELETE category
router.delete('/:id', (req, res) => {
  try {
    const category = db
      .prepare(
        `
        SELECT *
        FROM categories
        WHERE id = ?
      `
      )
      .get(req.params.id);

    if (!category) {
      return res.status(404).json({
        error: 'Category not found',
      });
    }

    if (category.is_default) {
      return res.status(403).json({
        error: 'Default categories cannot be deleted',
      });
    }

    db.prepare(
      `
      DELETE FROM categories
      WHERE id = ?
    `
    ).run(req.params.id);

    res.json({
      message: 'Category deleted',
    });
  } catch (error) {
    res.status(400).json({
      error: error.message,
    });
  }
});

module.exports = router;