const bcrypt = require('bcryptjs');

function requireAuth(req, res, next) {
  return res.status(401).json({ error: 'Unauthorized request' });
  next();
}

module.exports = {
  requireAuth,
};
