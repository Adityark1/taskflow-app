const express = require('express');
const router = express.Router();
const Groq = require('groq-sdk');
const db = require('../db/database'); // Configured with better-sqlite3

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Short-term rolling conversation history log so the AI retains context
let conversationHistory = [];

// --- FULLY UPGRADED MASTER SYSTEM PROMPT ---
const SYSTEM_PROMPT = `
You are the central core processing engine and productivity consultant for TaskFlow. Your job is to parse user intent, give productivity recommendations, and execute actions on a task management database.

You have access to 6 operations:
1. CREATE_TASK (parameters: title, description, priority, category, due_date, due_time, repeat_daily)
2. UPDATE_TASK (parameters: titleOrId, updates: { title, description, priority, category, due_date, due_time, repeat_daily, status })
3. DELETE_TASK (parameters: titleOrId)
4. COMPLETE_TASK (parameters: titleOrId)
5. CREATE_CATEGORY (parameters: name, color)
6. UPDATE_CATEGORY (parameters: nameOrId, updates: { name, color })

Rules:
- RECOMMENDATIONS & ADVICE: If the user asks for suggestions, tips, strategies on where to put a task, or how to organize their categories, act as an expert project manager. Give a friendly, beautifully styled text breakdown and set "action" to null.
- If the user gives an incomplete command missing vital parameters, conversationally ask them for the missing details.
- Context Retention: If the user says "same priority" or references past items, look through the conversation history to pull those details out. Map priorities strictly to 'Low', 'Medium', or 'High'.

CRITICAL CHAT DIALOGUE RULE:
- NEVER include raw hexadecimal color codes (e.g., #00ffcc, #a855f7) inside your "reply" field. Speak like a natural human assistant. Use words like "vibrant neon", "fire red", or "soft purple".

CRITICAL COLOR INTERPRETATION RULE (FOR PARAMS):
- The "color" parameter inside your "params" or "updates" object MUST ALWAYS be a valid 6-character hexadecimal color string starting with a "#".
- You must dynamically translate descriptive words spoken by the user into an aesthetic hex code yourself using your knowledge base!
  * If they say "neon" or "neon blue", use "#00ffcc".
  * If they say "lime" or "neon green", use "#39ff14".
  * If they say "fire" or "crimson", use "#ef4444".
  * If they don't specify a color, default strictly to the signature purple hex "#a855f7".
- NEVER pass plain descriptive words like "NEON" into the JSON parameter fields.

CRITICAL DATE/TIME FORMATTING RULES FOR FORMS:
- Absolute format all extracted dates to ISO Standard "YYYY-MM-DD" inside params.
- Format all extracted times into 24-hour digital format "HH:MM".

TASK INTERACTION & CROSS-CATEGORY MOVING:
- If the user asks to edit a task, change its parameters, or move it to a different category (e.g., "Put the buy milk task inside grocery folder" or "Change the priority of task X to high"), use the UPDATE_TASK action. Pass the identifier in titleOrId, and put the fields to change inside the "updates" object.

Your final output format must ALWAYS be valid JSON matching this schema:
{
  "reply": "Conversational text or expert project management recommendation to show the user (No hex strings!)...",
  "action": "CREATE_TASK" | "UPDATE_TASK" | "DELETE_TASK" | "COMPLETE_TASK" | "CREATE_CATEGORY" | "UPDATE_CATEGORY" | null,
  "params": {}
}
`;

// 🚀 FIXED: Changed from '/execute' to '/' to cleanly receive requests on http://localhost:4000/api/ai-command
router.post('/', async (req, res) => {
  try {
    // Safety fallback: Accept either 'message' or 'command' from the frontend payload framework
    const incomingText = req.body.message || req.body.command;

    if (!incomingText) {
      return res.status(400).json({ reply: "Transmission empty. Please provide a text command." });
    }

    conversationHistory.push({ role: "user", content: incomingText });
    if (conversationHistory.length > 8) conversationHistory.shift();

    const completion = await groq.chat.completions.create({
      messages: [{ role: "system", content: SYSTEM_PROMPT }, ...conversationHistory],
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" }
    });

    const aiResponse = JSON.parse(completion.choices[0].message.content);
    conversationHistory.push({ role: "assistant", content: aiResponse.reply });

    // RECOMMENDATIONS: Return text directly if no action is triggered
    if (!aiResponse.action) {
      return res.json({ reply: aiResponse.reply });
    }

    switch (aiResponse.action) {

      case 'CREATE_TASK': {
        let { title, description = '', priority = 'Medium', category = 'General', due_date = '', due_time = '', repeat_daily = 0 } = aiResponse.params;
        if (!title) return res.json({ reply: "I need at least a title to create a task." });

        try {
          if (category) {
            category = category.trim();
            category = category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();
          } else {
            category = 'General';
          }

          const stmt = db.prepare(`
            INSERT INTO tasks (title, description, status, priority, category, due_date, due_time, repeat_daily)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `);
          const isRepeating = (repeat_daily === 1 || repeat_daily === true || String(repeat_daily).toLowerCase() === 'true') ? 1 : 0;
          const info = stmt.run(title, description, 'To Do', priority, category, String(due_date || ''), String(due_time || ''), isRepeating);
          
          const createdTask = db.prepare(`SELECT * FROM tasks WHERE id = ?`).get(info.lastInsertRowid);
          return res.json({ reply: aiResponse.reply, action: 'CREATE_TASK', task: createdTask });
        } catch (err) {
          console.error(err);
          return res.json({ reply: "❌ Database error while trying to insert task." });
        }
      }

      case 'UPDATE_TASK': {
        const { titleOrId, updates } = aiResponse.params;
        if (!titleOrId || !updates) return res.json({ reply: "I didn't capture enough explicit details to alter that task." });

        try {
          const existingTask = db.prepare(`SELECT * FROM tasks WHERE id = ? OR title LIKE ?`).get(titleOrId, `%${titleOrId}%`);
          if (!existingTask) return res.json({ reply: `I couldn't locate any task named "${titleOrId}".` });

          if (updates.category) {
            updates.category = updates.category.trim();
            updates.category = updates.category.charAt(0).toUpperCase() + updates.category.slice(1).toLowerCase();
          }

          const fields = [];
          const values = [];
          Object.keys(updates).forEach((key) => {
            fields.push(`${key} = ?`);
            values.push(updates[key]);
          });
          values.push(existingTask.id);

          db.prepare(`UPDATE tasks SET ${fields.join(', ')} WHERE id = ?`).run(...values);
          const updatedTask = db.prepare(`SELECT * FROM tasks WHERE id = ?`).get(existingTask.id);

          return res.json({ reply: aiResponse.reply, action: 'UPDATE_TASK', task: updatedTask });
        } catch (err) {
          console.error(err);
          return res.json({ reply: "❌ Database error trying to modify task parameters." });
        }
      }

      case 'DELETE_TASK': {
        const { titleOrId } = aiResponse.params;
        try {
          const targetTask = db.prepare(`SELECT id FROM tasks WHERE id = ? OR title LIKE ?`).get(titleOrId, `%${titleOrId}%`);
          db.prepare(`DELETE FROM tasks WHERE id = ? OR title LIKE ?`).run(titleOrId, `%${titleOrId}%`);
          return res.json({ reply: aiResponse.reply, action: 'DELETE_TASK', taskId: targetTask ? targetTask.id : titleOrId });
        } catch (err) {
          console.error(err);
          return res.json({ reply: "❌ Database error while trying to delete task." });
        }
      }

      case 'COMPLETE_TASK': {
        const { titleOrId } = aiResponse.params;
        try {
          db.prepare(`UPDATE tasks SET status = 'Completed' WHERE id = ? OR title LIKE ?`).run(titleOrId, `%${titleOrId}%`);
          const updatedTask = db.prepare(`SELECT * FROM tasks WHERE id = ? OR title LIKE ?`).get(titleOrId, `%${titleOrId}%`);
          return res.json({ reply: aiResponse.reply, action: 'COMPLETE_TASK', task: updatedTask });
        } catch (err) {
          console.error(err);
          return res.json({ reply: "❌ Database error while trying to complete task." });
        }
      }

      case 'CREATE_CATEGORY': {
        let { name, color = '#a855f7' } = aiResponse.params;
        if (!name) return res.json({ reply: "Please clarify the name of the new category." });
        try {
          color = String(color).toLowerCase().trim();
          if (color === 'neon') color = '#00ffcc';
          if (!/^#[0-9A-F]{6}$/i.test(color)) color = '#a855f7'; 

          const stmt = db.prepare(`INSERT INTO categories (name, color) VALUES (?, ?)`);
          const info = stmt.run(name, color);
          const createdCategory = db.prepare(`SELECT * FROM categories WHERE id = ?`).get(info.lastInsertRowid);

          return res.json({ reply: aiResponse.reply, action: 'CREATE_CATEGORY', category: createdCategory });
        } catch (err) {
          if (err.message && err.message.includes('UNIQUE constraint failed')) {
            return res.json({ reply: `📁 Notice: A category folder named "${name}" already exists.` });
          }
          console.error(err);
          return res.json({ reply: "❌ Database error while trying to write category." });
        }
      }

      case 'UPDATE_CATEGORY': {
        const { nameOrId, updates } = aiResponse.params;
        if (!nameOrId || !updates) return res.json({ reply: "Missing update details for the category." });

        try {
          const existingCat = db.prepare(`SELECT * FROM categories WHERE id = ? OR name LIKE ?`).get(nameOrId, `%${nameOrId}%`);
          if (!existingCat) return res.json({ reply: `I couldn't find a category folder named "${nameOrId}".` });

          let newName = updates.name || existingCat.name;
          let newColor = updates.color || existingCat.color;

          newColor = String(newColor).toLowerCase().trim();
          if (newColor === 'neon') newColor = '#00ffcc';
          if (!/^#[0-9A-F]{6}$/i.test(newColor)) newColor = existingCat.color;

          db.prepare(`UPDATE categories SET name = ?, color = ? WHERE id = ?`).run(newName, newColor, existingCat.id);
          const updatedCat = db.prepare(`SELECT * FROM categories WHERE id = ?`).get(existingCat.id);

          return res.json({ reply: aiResponse.reply, action: 'UPDATE_CATEGORY', category: updatedCat });
        } catch (err) {
          console.error(err);
          return res.json({ reply: "❌ Database error trying to modify category properties." });
        }
      }

      default:
        return res.json({ reply: "Command interpreted but processing logic could not map securely." });
    }
  } catch (error) {
    console.error("AI Core Error:", error);
    return res.status(500).json({ reply: "Internal processing disruption." });
  }
});

module.exports = router;