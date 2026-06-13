const dashboardService=require('../service/dashboard.service')
const ApiResponse=require('../utils/ApiResponse')

const getDashboardStats=async(req,res)=>
{

    try{
    const stats=await dashboardService.getDashboardStats();

    return res
        .status(200)
        .json(new ApiResponse(
            200,
            'Dashboard Stats Fetched Successfully',
            stats
        ));
}

catch(error){
      return res
            .status(error.statusCode || 500)
            .json({
                success: false,
                message: error.message || 'Something went wrong'
            });
}
}

module.exports = {
    getDashboardStats
};