const jwt = require('jsonwebtoken');
const User = require('./models/User');

async function getUserFromToken(req) {
  const auth = req.headers.authorization || "";
  if (!auth.startsWith("Bearer ")) return null;

  const token = auth.replace("Bearer ", "");

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    return user;
  } catch (e) {
    return null;
  }
}

module.exports = { getUserFromToken };