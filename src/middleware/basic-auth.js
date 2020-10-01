const bcrypt = require('bcryptjs');

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
  req.app
    .get('db')('thingful_users')
    .select()
    .where({ user_name: tokenUserName })
    .first()
    .then((result) => {
      bcrypt
        .compare(tokenPassword, result.password)
        .then((passwordsMatch) => {
          if (!passwordsMatch) {
            return res.status(401).json({ error: 'Unauthorized request' });
          }
        })
        .then(() => {
          const db = req.app.get('db');
          db('thingful_users')
            .select()
            .then((results) => {
              const foundUser = results.filter((result) => {
                return result.user_name === tokenUserName;
              });
              if (foundUser.length === 0) {
                res.status(404).send('Invalid Credentials');
              }
              req.user_id = foundUser[0].id;
              next();
            })
            .catch(next);
        });
    });
}

module.exports = requireAuth;
