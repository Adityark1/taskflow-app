CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'To Do',
    priority TEXT DEFAULT 'Medium',
    category TEXT DEFAULT 'General',
    due_date TEXT,
    due_time TEXT,
    repeat_daily INTEGER DEFAULT 0
);