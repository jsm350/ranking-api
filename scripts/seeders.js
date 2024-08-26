require('dotenv').config();
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const path = require('path');
const jwt = require('jsonwebtoken');

const dbPath = path.resolve(__dirname, '../config/database.sqlite');
const db = new sqlite3.Database(dbPath);

const seedData = async () => {
    const saltRounds = 10;
    const hashedPassword1 = await bcrypt.hash(process.env.PASSWORD, saltRounds);
    const username = process.env.LOGIN_USERNAME;

    // Generate a JWT token
    const token = jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: '30d' });

    db.serialize(() => {
        // Create the users table if it does not exist, with the token field
        db.run(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE,
                password TEXT,
                token TEXT
            )
        `);

        // Check if the user already exists
        db.get('SELECT id FROM users WHERE username = ?', [username], (err, row) => {
            if (err) {
                console.error('Error querying the database:', err.message);
                return db.close();
            }

            if (!row) {
                const stmt = db.prepare('INSERT INTO users (username, password, token) VALUES (?, ?, ?)');
                stmt.run(username, hashedPassword1, token);
                stmt.finalize();
                console.log(`User ${username} inserted successfully with token.`);
            } else {
                console.log(`User ${username} already exists. Skipping insertion.`);
            }

            // Close the database connection
            db.close();
        });
    });
};

seedData().catch((err) => console.error(err));
