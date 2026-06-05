const bcrypt = require("bcryptjs");
const User = require("../models/Users");
const Employee = require("../models/Employees");
const sendEmail = require("./sendEmail");
const generateTemporaryPassword = require("./generateTemporaryPassword");
const buildEmployeeData = require("./buildEmployeeData");
const validateUniqueEmployeeFields = require("../validators/validateUniqueEmployeeFields");
/**
*  Creates employee + user account
* @param {Object} req - The request object containing employee and user data
* @param {Object} options - Additional options for account creation
* @param {Array<string>} options.roles - The roles to assign to the user
* @param {Function} options.emailTemplate - A function that generates email content given username and temporary password
* @returns {Promise<{ employee: Object, user: Object }>} A promise that resolves with the created employee and user objects
*/
async function createAccountWithEmployee(
    req,
    { roles, emailTemplate }
) {
    const { username, email } = req.body;

    // Reject if username, email, or medical registration number is already taken
    const uniquenessResult = await validateUniqueEmployeeFields(req.body);
    if (!uniquenessResult.success) {
        const err = new Error(uniquenessResult.message);
        err.status = uniquenessResult.status;
        throw err;
    }

    // Generate a temporary password
    const temporaryPassword = generateTemporaryPassword();
    const passwordHash = await bcrypt.hash(temporaryPassword, 10);
    const employeeData = buildEmployeeData(req.body);

    // Persist the employee record
    const employee = new Employee(employeeData);
    await employee.save();

    // Create the linked user account with mustChangePassword set to true
    const user = new User({
        username,
        email,
        passwordHash,
        roles,
        employeeCode: employee.employeeCode,
        status: "ACTIVE",
        mustChangePassword: true,
        createdByAdmin: true,
        approvedBy: req.user.employeeCode,
        approvedAt: new Date(),
        createdBy: req.user.employeeCode,
    });
    await user.save();

    // Email the temporary password
    try {
        await sendEmail({
            to: user.email,
            ...emailTemplate({ username, temporaryPassword }),
        });
    } catch (emailError) {
        console.error("Email sending error:", emailError);
    }

    return { employee, user };
}

module.exports = createAccountWithEmployee;