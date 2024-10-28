const jwt = require('jsonwebtoken');
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.sendStatus(401);
    jwt.verify(authHeader, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.sendStatus(403);
        } else {
            req.user = user;
            next(); // Token is valid, proceed
        }
    });
}

module.exports = { authenticateToken };