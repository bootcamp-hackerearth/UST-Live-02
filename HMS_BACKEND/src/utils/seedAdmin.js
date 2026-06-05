const bcrypt = require('bcrypt');
const Employee = require('../models/employee.model');
const User = require('../models/user.model');
const Role = require('../models/role.model');
const seedAdmin = async () => {
    try {
        const admin = await Role.findOne({ roleCode: "ADM" });
        console.log("admin: ", admin);
        const existingUser = await User.findOne({ email: 'admin@gmail.com' });
        if (existingUser) {
            console.log('Admin already seeded');
            return;
        }
        const passwordHash = await bcrypt.hash('Admin@123', 12);

        const user = await User.create({
            firstName: 'Super',
            lastName: 'Admin',
            email: 'admin@gmail.com',
            phone: '9999999999',
            passwordHash,
            roleId: admin._id,
            isVerified: true,
        });

        await Employee.create({
            userId: user._id,
            employeeCode: 'ADM001',
            department: 'ADMIN',
            designation: 'Administrator',
            status: true,
            joiningDate: new Date()
        });

        console.log('Admin seeded successfully');
    }
    catch (error) {
        if (error.code === 11000) {
            console.log("Roles already seeded");
        } else {
            console.error("Error seeding roles:", error.message);
        }
    }
}

module.exports = seedAdmin;
