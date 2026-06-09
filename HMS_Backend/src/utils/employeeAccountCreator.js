const bcrypt = require("bcryptjs");
const User = require("../models/Users");
const Employee = require("../models/Employees");
const sendMail = require("./mailClient");
const createTemporaryPassword = require("./temporaryPasswordGenerator");
const buildEmployeePayload = require("./employeePayloadBuilder");
const ensureUniqueEmployeeFields = require("../validators/employeeUniquenessValidator");
const writeAuditLog = require("./auditLogger");
const resolveAuditActor = require("./actorResolver");

async function createEmployeeAccount(
    req,
    { roles, emailTemplate, auditAction, buildAuditMessage }
) {
    const { username, email } = req.body;

    const uniquenessResult = await ensureUniqueEmployeeFields(req.body);
    if (!uniquenessResult.success) {
        const err = new Error(uniquenessResult.message);
        err.status = uniquenessResult.status;
        throw err;
    }

    const temporaryPassword = createTemporaryPassword();
    const passwordHash = await bcrypt.hash(temporaryPassword, 10);
    const employeeData = buildEmployeePayload(req.body);

    const employee = new Employee(employeeData);
    await employee.save();

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

    try {
        await sendMail({
            to: user.email,
            ...emailTemplate({ username, temporaryPassword }),
        });
    } catch (emailError) {
        console.error("Email sending error:", emailError);
    }

    const actor = await resolveAuditActor(req.user);
    await writeAuditLog({
        actor,
        action: auditAction,
        targetType: "EMPLOYEE",
        targetId: employee.employeeCode,
        message: buildAuditMessage(employee),
    });

    return { employee, user };
}

module.exports = createEmployeeAccount;