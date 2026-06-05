const { verifyToken, tokenType } = require('../utils/jwt')

const authMiddleware = (req, res, next) => {
    try {
        //read authorization header 
        console.log('in auth middleware');
        const authHeader = req.headers.authorization;

        if (

            !authHeader?.startsWith("Bearer ")

        ) {
            console.log('in auth middleware');
            return res.status(401).json(
                {
                    success: false,
                    message: "Token Missing"
                }
            );
        }

        //extracting the token from the bearer 

        const token = authHeader.split(" ")[1];

        const decoded = verifyToken({ token, type: tokenType.ACCESS });

        req.user = decoded;
        next();
        console.log(req.user);

    }
    catch (error) {
        console.log(error);
        return res.status(401).json({
            success: false,
            message: error.message || "Invalid or expired token "
        });

    }
};

module.exports = authMiddleware;