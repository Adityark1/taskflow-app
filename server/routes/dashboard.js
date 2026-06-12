const express = require('express');
const router = express.Router();
const db = require('../db/database');

router.get('/metrics', (req, res) => {
    try {
        // 🌟 FIX: Guard against missing or corrupted status strings
        const totalTasks = db.prepare('SELECT COUNT(*) as count FROM tasks').get().count;
        
        const completedTasks = db.prepare(`
            SELECT COUNT(*) as count FROM tasks 
            WHERE COALESCE(status, 'To Do') = 'Completed'
        `).get().count;
        
        const pendingTasks = db.prepare(`
            SELECT COUNT(*) as count FROM tasks 
            WHERE COALESCE(status, 'To Do') != 'Completed'
        `).get().count;
        
        // 🌟 FIX: Handle priority strings safely
        const highPriority = db.prepare(`
            SELECT COUNT(*) as count FROM tasks 
            WHERE COALESCE(priority, 'Medium') = 'High'
        `).get().count;
        
        const mediumPriority = db.prepare(`
            SELECT COUNT(*) as count FROM tasks 
            WHERE COALESCE(priority, 'Medium') = 'Medium'
        `).get().count;
        
        const lowPriority = db.prepare(`
            SELECT COUNT(*) as count FROM tasks 
            WHERE COALESCE(priority, 'Medium') = 'Low'
        `).get().count;

        const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

        const categoryMetrics = db.prepare(`
            SELECT COALESCE(NULLIF(category, ''), 'General') as category, COUNT(*) as count 
            FROM tasks 
            GROUP BY COALESCE(NULLIF(category, ''), 'General')
        `).all();

        // 🌟 FIX: Prevent calculation breaking if due_date is entirely missing
        const rawStreak = db.prepare(`
            SELECT COUNT(DISTINCT due_date) as streak 
            FROM tasks 
            WHERE COALESCE(status, 'To Do') = 'Completed' 
              AND due_date != '' 
              AND due_date IS NOT NULL
        `).get().streak;
        const currentStreak = rawStreak > 0 ? rawStreak : 0;

        const criticalAlerts = db.prepare(`
            SELECT COUNT(*) as count FROM tasks 
            WHERE COALESCE(status, 'To Do') != 'Completed' 
              AND COALESCE(priority, 'Medium') = 'High'
        `).get().count;

        let productivityIndex = 50; 
        if (totalTasks > 0) {
            const basicWeight = completionRate * 0.7;
            const penaltyWeight = (criticalAlerts / totalTasks) * 30;
            productivityIndex = Math.max(10, Math.min(100, Math.round(basicWeight + 30 - penaltyWeight)));
        }

        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        res.json({
            totalTasks,
            completedTasks,
            pendingTasks,
            completionRate,
            currentStreak,
            criticalAlerts,
            productivityIndex,
            priorities: { high: highPriority, medium: mediumPriority, low: lowPriority },
            categoryMetrics
        });
    } catch (error) {
        console.error("Database Metrics Engine Error:", error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;