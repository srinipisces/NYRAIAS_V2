module.exports = function (requiredPath) {
  return (req, res, next) => {
    const access = req.user?.access;

    if (!Array.isArray(access)) {
      return res.status(401).json({ error: 'Access denied: no access array found' });
    }

    if (!access.includes(requiredPath)) {
      return res.status(403).json({ error: `Access denied: missing ${requiredPath}` });
    }

    next(); // ✅ Access granted
  };
};
