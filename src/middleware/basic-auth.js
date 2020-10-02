const AuthService = require('../auth/auth-service.js')

function requireAuth(req, res, next) {
  const authToken = req.get('Authorization') || '';
  let basicToken;
  if (!authToken.toLowerCase().startsWith('basic ')) {
    return res.status(401).json({ error: 'Missing basic token' });
  } else {
    basicToken = authToken.slice('basic '.length, authToken.length);
  }

  const [tokenUserName, tokenPassword] = Buffer.from(basicToken, 'base64')
    .toString()
    .split(':');

  if (!tokenUserName) {
    return res.status(401).json({ error: 'Unauthorized request' });
  }
  const db = req.app.get('db');
  db('thingful_users')
    .select()
    .where({ user_name: tokenUserName })
    .first()
    .then((user) => {
      if (!user) {
        return res.status(401).json({ error: 'Unauthorized request' });
      }
      return AuthService
        .compare(tokenPassword, user.password)
        .then((passwordsMatch) => {
          if (!passwordsMatch) {
            return res.status(401).json({ error: 'Unauthorized request' });
          }

          req.user_id = user.id;
          next();
        });
    })
    .catch(next);
}

module.exports = requireAuth;
