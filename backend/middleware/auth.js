import jwt from 'jsonwebtoken';

export default function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'ACCESS DENIED. TOKEN MISSING.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'frkwear_ultra_secret_change_this_in_prod');
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'INVALID OR EXPIRED TOKEN. ACCESS DENIED.' });
  }
}
