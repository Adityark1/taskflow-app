const express = require('express');
const router = express.Router();
const db = require('../db/database');

// GET ALL TASKS
router.get('/', (req, res) => {
  try {
    const tasks = db
      .prepare(
        `
        SELECT
          tasks.*,
          categories.name AS category_name,
          categories.color AS category_color
        FROM tasks
        LEFT JOIN categories
        ON tasks.category_id = categories.id
        ORDER BY tasks.id DESC
      `
      )
      .all();

    res.json(tasks);
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
});

// GET TASKS BY CATEGORY
router.get('/category/:id', (req, res) => {
  try {
    const tasks = db
      .prepare(
        `
        SELECT *
        FROM tasks
        WHERE category_id = ?
        ORDER BY id DESC
      `
      )
      .all(req.params.id);

    res.json(tasks);
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
});

// CREATE TASK
router.post('/', (req, res) => {
  try {
    const {
      title,
      category_id,
      start_date,
      start_time,
      end_date,
      end_time,
    } = req.body;

    const stmt = db.prepare(`
      INSERT INTO tasks (
        title,
        category_id,
        start_date,
        start_time,
        end_date,
        end_time
      )
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      title,
      category_id || null,
      start_date || null,
      start_time || null,
      end_date || null,
      end_time || null
    );

    const newTask = db
      .prepare(
        `
        SELECT *
        FROM tasks
        WHERE id = ?
      `
      )
      .get(result.lastInsertRowid);

    res.status(201).json(newTask);
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
});

// DELETE TASK
router.delete('/:id', (req, res) => {
  try {
    db.prepare(
      `
      DELETE FROM tasks
      WHERE id = ?
    `
    ).run(req.params.id);

    res.json({
      success: true,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
});

module.exports = router;