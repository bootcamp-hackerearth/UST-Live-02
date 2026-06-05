const Role = require("../models/role.model");

const roles = [
    {
        roleCode: "OWN",
        name: "Owner",
    },
    {
        roleCode: "ADM",
        name: "Administrator",
    },
    {
        roleCode: "DOC",
        name: "Doctor",
    },
    {
        roleCode: "REC",
        name: "Receptionist",
    },
    {
        roleCode: "CSH",
        name: "Cashier",
    },
    {
        roleCode: "NUR",
        name: "Nurse",
    },
    {
        roleCode: "LAB",
        name: "Lab Technician",
    },
    {
        roleCode: "PHA",
        name: "Pharmacist",
    },
    {
        roleCode: "PAT",
        name: "Patient",
    },
];

const seedRoles = async () => {
    try {
        await Role.insertMany(roles, {
            ordered: false,
        });

        console.log("Roles seeded successfully");
    } catch (error) {
        if (error.code === 11000) {
            console.log("Roles already seeded");
        } else {
            console.error("Error seeding roles:", error.message);
        }
    }
};

module.exports = seedRoles;