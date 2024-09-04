// middleware/auth.js
const jwt = require('jsonwebtoken');
require('dotenv').config();

const auth = (roles = []) => {
  return (req, res, next) => {
    const token = req.header('x-auth-token');
    if (!token) return res.status(401).json({ error: 'No token, authorization denied' });

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      if (roles.length && !roles.includes(req.user.role)) {
        return res.status(403).json({ error: 'Forbidden' });
      }
      next();
    } catch (err) {
      res.status(400).json({ error: 'Token is not valid' });
    }
  };
};

module.exports = auth;
