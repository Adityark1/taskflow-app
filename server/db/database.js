const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

// FIXED: Resolves the absolute path to make sure it always references 'server/db/taskflow.db'
const dbPath = path.join(__dirname, 'taskflow.db');
const db = new Database(dbPath, { verbose: console.log });

// Automatically apply the schema from schema.sql
const schemaPath = path.join(__dirname, 'schema.sql');
const schema = fs.readFileSync(schemaPath, 'utf8');
db.exec(schema);

module.exports = db;