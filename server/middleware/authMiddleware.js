// server/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const { SECRET_KEY } = require('../config');

const authMiddleware = (req, res, next) => {
    const token = req.headers.authorization;
    if (!token) {
        return res.status(401).json({ success: false, message: 'No token provided' });
    }
    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) {
            return res.status(401).json({ success: false, message: 'Invalid token' });
        }
        req.userId = decoded.userId;
        next();
    });
};

module.exports = authMiddleware;
