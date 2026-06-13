const ApiResponse = require('../utils/ApiResponse')
const authService=require('../service/auth.service')

const verifyEmail=async(req,res)=>{
    try{
        const{token}=req.params;

        const result=await authService.verifyEmployeeEmail(token);
        return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                "Email Verified Successfully",
                result
            )
        );
    }
    catch(error){
         return res
            .status(error.statusCode || 500)
            .json({
                success: false,
                message: error.message || "something went wrong"
            });
    };
};

const patientLogin=async(req,res)=>{
    try{
        const result=await authService.loginPatient(req.body);
        return res
            .status(200)
            .json(new ApiResponse(200,"Login Successfull",result));


    }
    catch(error)
    {
        return res 
        .status(error.statusCode||500)
        .json({
            success:false,
            message:error.message||"something went wrong"
        });

    };
}

const login=async(req,res)=>{
    try{
        const result=await authService.loginEmployee(req.body);
        return res
            .status(200)
            .json(new ApiResponse(200,"Login Successfull",result));


    }
    catch(error)
    {
        return res 
        .status(error.statusCode||500)
        .json({
            success:false,
            message:error.message||"something went wrong"
        });

    };
}


const changePassword = async (req, res, next) => {
    try {
        const userId = req.user.userId;

        const result = await authService.changePassword(userId, req.body);

        return res.status(200).json({
            success: true,
            message: "Password changed successfully",
            data: result
        });

    } catch (error) {
        next(error);
    }
};

module.exports={verifyEmail,login,changePassword,patientLogin};