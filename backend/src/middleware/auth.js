import jwt from 'jsonwebtoken';
const auth = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: { message: 'Authentication required' } });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretkey');
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: { message: 'Invalid token' } });
  }
};
export default auth;