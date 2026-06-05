const jwt = require('jsonwebtoken');
/**
 * Authenticates a user based on a JWT token
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @param {Function} next - The next middleware function
 * @returns {Promise<void>} A promise that resolves when the user is authenticated
 */
const authenticateUser = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
        return res.status(401).json({
            message: "No token provided"
        });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        req.user = decoded;

        next();

    } 
    catch (err) {
      console.error("Error:", err);
      return res.status(401).json({
          message: "Invalid or expired token"
      });
    }
};

module.exports = authenticateUser;