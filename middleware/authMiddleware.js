const jwt = require('../utilitis/jwt');
const User = require('../models/user');

const auth = (roles = []) => {
  return async (req, res, next) => {
    const authHeader = req.header('Authorization');
    if (!authHeader) {
      return res.status(401).send({ error: 'No token provided' });
    }

    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
    try {
      const decoded = jwt.verifyToken(token);
      const user = await User.findById(decoded.id);
      if (!user) {
        return res.status(401).send({ error: 'Invalid token' });
      }

      if (roles.length && !roles.includes(user.role)) {
        return res.status(403).send({ error: 'Access denied' });
      }

      req.user = user;
      next();
    } catch (err) {
      return res.status(401).send({ error: 'Invalid token' });
    }
  };
};

module.exports = auth;
