const Employee = require("../models/Employees");

const resolveAuditActor = async (reqUser) => {
    const employeeCode = reqUser?.employeeCode;

    if (!employeeCode) {
        return {};
    }

    try {
        const employee = await Employee.findOne({ employeeCode }).select(
            "name designation"
        );

        return {
            employeeCode,
            name: employee?.name,
            designation: employee?.designation
        };
    } catch (err) {
        console.error("resolveAuditActor error:", err.message);
        return { employeeCode };
    }
};

module.exports = resolveAuditActor;