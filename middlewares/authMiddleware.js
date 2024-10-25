const jwt = require('jsonwebtoken');
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.sendStatus(401);
    jwt.verify(authHeader, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            // If token is expired, generate a new token
            if (err.name === 'TokenExpiredError') {
                const refreshToken = req.headers['authorization']; // Assuming refresh token is sent in headers
                if (!refreshToken) return res.sendStatus(401); // No refresh token

                // Verify the refresh token
                jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (refreshErr, decoded) => {
                    if (refreshErr) return res.sendStatus(403); // Invalid refresh token

                    // Issue a new token
                    const newToken = jwt.sign({ userId: decoded.userId }, process.env.JWT_SECRET, { expiresIn: '30d' });
                    res.setHeader('authorization', newToken); // Send the new token in headers
                    req.user = decoded;
                    next(); // Proceed with the request
                });
            } else {
                return res.sendStatus(403); // Other JWT errors
            }
        } else {
            req.user = user;
            next(); // Token is valid, proceed
        }
    });
}

module.exports = { authenticateToken };