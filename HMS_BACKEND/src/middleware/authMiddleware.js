const jwt = require('jsonwebtoken');
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
if (!authHeader?.startsWith('Bearer ')) {
  return res.status(401).json({ message: 'No token provided' });
}

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    console.log(req.user);
    next();
    console.log("SECRET:", process.env.JWT_SECRET);
  } 
catch (err) {
    console.error('JWT verification failed:', err.message); 
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};
module.exports=authMiddleware;