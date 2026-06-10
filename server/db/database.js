// server/db/database.js
const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

// Initialize the database file
const db = new Database('taskflow.db', { verbose: console.log });

// Automatically apply the schema from schema.sql
const schemaPath = path.join(__dirname, 'schema.sql');
const schema = fs.readFileSync(schemaPath, 'utf8');
db.exec(schema);

module.exports = db;