const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../config/database.sqlite');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    console.log('Checking structure of the "users" table:');
    db.all('PRAGMA table_info(users)', (err, rows) => {
        if (err) {
            console.error('Error retrieving "users" table structure:', err.message);
            return;
        }

        console.log('Columns in "users" table:');
        rows.forEach((row) => {
            console.log(`- ${row.name} (${row.type})${row.pk ? ' [PRIMARY KEY]' : ''}`);
        });
    });

    console.log('Checking structure of the "producer_article" table:');
    db.all('PRAGMA table_info(producer_article)', (err, rows) => {
        if (err) {
            console.error('Error retrieving "producer_article" table structure:', err.message);
            return;
        }

        console.log('Columns in "producer_article" table:');
        rows.forEach((row) => {
            console.log(`- ${row.name} (${row.type})${row.pk ? ' [PRIMARY KEY]' : ''}`);
        });
    });

    // Close the database connection
    db.close((err) => {
        if (err) {
            console.error('Error closing the database:', err.message);
        } else {
            console.log('Database connection closed.');
        }
    });
});
