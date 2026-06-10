const Patient = require('../models/Patient.model')
const Employee = require('../models/Employee.model')
const JoinUs=require('../models/joinUs.model')

const User = require('../models/User.model')
const ApiError = require('../utils/ApiError')


exports.getDashboardStats = async () => {

    try {
        const [totalPatients,
            totalEmployees,
            pendingApprovals
        ] = await Promise.all([
            Patient.countDocuments(),
            Employee.countDocuments(),
            JoinUs.countDocuments({ isVerified: true,
                approvalStatus:"PENDING"
            })
        ]);

        return {
            totalPatients,
            totalEmployees,
            pendingApprovals
        }




    }
    catch (error) {
        throw new ApiError(500,error.message);
    }
}