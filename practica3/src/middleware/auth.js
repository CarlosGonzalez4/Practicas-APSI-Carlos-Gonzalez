const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { JWT_SECRET } = process.env;

module.exports = async function (req, res, next) {
  const auth = req.header('Authorization');
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token inválido' });
  }
  const token = auth.split(' ')[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    // attach user id to req
    req.user = { id: payload.id };
    next();
  } catch (e) {
    return res.status(401).json({ message: 'Token inválido' });
  }
};
