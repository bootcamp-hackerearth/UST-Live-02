const ApiResponse = require('../utils/ApiResponse');
const doctorService = require('../service/doctor.service');

const createDoctor = async (req, res) => {
    try {
        console.log(' creating doctor');
        const doctor = await doctorService.createDoctor(req.body);

        return res
            .status(201)
            .json(new ApiResponse(201, 'Doctor created successfully', doctor));
    } catch (error) {
        const statusCode = error.statusCode || 500;

        return res
            .status(statusCode)
            .json({
                success: false,
                statusCode,
                message: error.message || 'Doctor creation failed'
            });
    }
};

module.exports = {
    createDoctor
};