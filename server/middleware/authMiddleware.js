const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require('../config');

const authMiddleware = (req, res, next) => {
    const token = req.headers.authorization;

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }

    jwt.verify(token.split(" ")[1], SECRET_KEY, (err, decoded) => {
        if (err) {
            console.error('JWT Verification Error:', err);
            return res.status(401).json({ message: 'Unauthorized: Invalid token' });
        }
        console.log('Decoded Token:', decoded);
        req.userId = decoded.userId;
        next();
    });
};

module.exports = authMiddleware;
