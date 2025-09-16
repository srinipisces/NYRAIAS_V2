const jwt = require('jsonwebtoken');
const pool = require('./db');

const JWT_SECRET = process.env.JWT_SECRET;

const authenticate = async (req, res, next) => {
  // 🔍 Get token from cookie or Authorization header
  const header = req.get('authorization') || '';
  const bearer = header.startsWith('Bearer ') ? header.slice(7) : null;
  const token = req.cookies?.token || bearer;

  //const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Missing or invalid token' });
  }

  try {
    // ✅ Decode token
    const decoded = jwt.verify(token, JWT_SECRET);
    const { userid, accountid } = decoded;

    // ✅ Check token presence in DB
    const result = await pool.query(
      'SELECT 1 FROM active_tokens WHERE token = $1 AND userid = $2 AND accountid = $3',
      [token, userid, accountid]
    );

    if (result.rows.length === 0) {
      res.clearCookie('token', {
        httpOnly: true,
        secure: true,
        sameSite: 'Lax',
        path:'/',
        domain: '.nyraias.com',
      });
      return res.status(401).json({ message: 'Token expired or invalid' });
    }

    req.user = decoded;
    next();
  } catch (err) {
    console.error('Token verification failed:', err.message);
    res.clearCookie('token', {
        httpOnly: true,
        secure: true,
        sameSite: 'Lax',
        path:'/',
        domain: '.nyraias.com'
      });
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

module.exports = { authenticate };
