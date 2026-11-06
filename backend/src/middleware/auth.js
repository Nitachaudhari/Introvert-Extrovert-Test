const jwt = require('jsonwebtoken');
const User = require('../models/User');

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    return 'kiei_production_default_secret_key_2026_psychometric_eval';
  }
  return secret;
};

const requireAuth = async (req, res, next) => {
  try {
    const authorization = req.get('Authorization') || '';
    const [scheme, token] = authorization.split(' ');
    if (scheme !== 'Bearer' || !token) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }

    const payload = jwt.verify(token, getJwtSecret(), {
      issuer: 'psychometric-assessment-api',
      audience: 'psychometric-assessment-web',
    });
    const user = await User.findById(payload.sub).select('name email role active');
    if (!user || !user.active) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }

    req.user = user;
    return next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Your session is invalid or expired.' });
    }
    return next(error);
  }
};

const requireRole = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ success: false, message: 'You do not have permission to perform this action.' });
  }
  return next();
};

module.exports = { getJwtSecret, requireAuth, requireRole };
