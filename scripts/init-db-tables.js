const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../config/database.sqlite');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    // Recreate the tables
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE,
            password TEXT,
            token TEXT
        )
    `, (err) => {
        if (err) {
            console.error('Error creating users table:', err.message);
        } else {
            console.log('Users table created successfully.');
        }
    });

    db.run(`
        CREATE TABLE IF NOT EXISTS producer_article (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            producer_id INTEGER,
            producer_slug TEXT, 
            link TEXT NOT NULL,
            title TEXT,
            excerpt TEXT,
            image_url TEXT
        )
    `, (err) => {
        if (err) {
            console.error('Error creating producer_article table:', err.message);
        } else {
            console.log('Producer_article table created successfully.');
        }
    });
});

db.close();
