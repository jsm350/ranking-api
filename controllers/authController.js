const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const db = require('../config/db');

exports.login = async (req, res) => {
    const { username, password } = req.body;
    db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
        if (err) {
            return res.status(500).json({ message: 'Database error' });
        }
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        bcrypt.compare(password, user.password, (err, result) => {
            if (err) {
                return res.status(500).json({ message: 'Password comparison error' });
            }
            if (!result) {
                return res.status(400).json({ message: 'Invalid credentials' });
            }
            const token = user.token;
            db.run('UPDATE users SET token = ? where username = ?', [token, username])
            res.json({ token });
        });
    });
};


exports.me = (req, res) => {
    const token = req.params.token;

    if (!token) {
        return res.status(400).json({ message: 'Token is required' }); // Bad Request if no token is provided
    }

    db.get('SELECT id FROM users WHERE token = ?', [token], (err, user) => {
        if (user) {
            return res.status(200).json({ message: 'Verified' }); // User found, verified
        } else {
            return res.status(401).json({ message: 'Unverified' }); // User not found, unverified
        }
    })
};