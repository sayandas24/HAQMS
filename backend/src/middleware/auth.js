import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'my-super-secret-secret-key-12345!!!';

// Authentication middleware
export const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // FIXED: Enforce token expiration validation by changing ignoreExpiration to false
    const decoded = jwt.verify(token, JWT_SECRET, { ignoreExpiration: false }); 
    
    // Add user details to request object
    req.user = decoded;
    next();
  } catch (error) {
    // FIXED: Sanitize JWT verification error to avoid leaking secret key mismatches
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
};

// Role authorization middleware
export const authorize = (roles = []) => {
  if (typeof roles === 'string') {
    roles = [roles];
  }

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized. User context missing.' });
    }

    // Role-based verification
    if (roles.length && !roles.includes(req.user.role)) {
      return res.status(403).json({ error: `Forbidden. Requires role: ${roles.join(' or ')}` });
    }

    next();
  };
};

// FIXED: Implemented actual admin role verification to protect admin-only legacy actions
export const authorizeAdminOnlyLegacy = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized.' });
  }
  
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Access denied. Admin only.' });
  }
  
  next();
};
