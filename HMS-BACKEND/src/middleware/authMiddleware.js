const {verifyToken} =require('../utils/jwt')

const authMiddleware=(req,res,next)=>
{
    try{
      
        //read authorization header 

        const authHeader=req.headers.authorization;

        if(
            !authHeader?.startsWith("Bearer ")
        )
        {
            return res.status(401).json(
                {
                success:false,
                message:"Token Missing"
                }
            );
        }
    
        //extracting the token from the bearer 

        const token =authHeader.split(" ")[1];

        const decoded=verifyToken(token);


        req.user=decoded;
        next();
        console.log(req.user);

    }
    catch(error)
    {
        return res.status(401).json({
        success:false,
        message:error.message||"Invalid or expired token "
        });
        
    }
};

module.exports =authMiddleware;