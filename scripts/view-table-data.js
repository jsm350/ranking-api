const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../config/database.sqlite');
const db = new sqlite3.Database(dbPath);

const viewData = () => {
    db.serialize(() => {
        // Query and display data from the users table
        db.all('SELECT * FROM users', [], (err, rows) => {
            if (err) {
                throw err;
            }
            console.log('Users Table Data:');
            rows.forEach((row) => {
                console.log(row);
            });

            db.all('SELECT * FROM producer_article', [], (err, rows) => {
                if (err) {
                    throw err;
                }
                console.log('Producer Article Table Data:');
                rows.forEach((row) => {
                    console.log(row);
                });
            });
        });
    });

};

viewData();
