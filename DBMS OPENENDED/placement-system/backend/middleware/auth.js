const jwt = require('jwt-simple');

const SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

const verifyToken = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({ success: false, message: 'No token provided' });
        }

        const decoded = jwt.decode(token, SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: 'Invalid token' });
    }
};

const authorizeRole = (requiredRoles) => {
    return (req, res, next) => {
        const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ success: false, message: 'Unauthorized access' });
        }
        next();
    };
};

module.exports = { verifyToken, authorizeRole };
