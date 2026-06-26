const Node = require("../models/Node.model");

const seedMenus = async () => {
  try {
    await Node.deleteMany({});

    const menus = [
      {
        name: "Patients",
        path: "/patients",
        icon: "bi bi-person-hearts",
        role: ["Admin", "Receptionist", "Owner"],
        order: 2,
      },
      {
        name: "Employees",
        path: "/employees",
        icon: "bi bi-person-badge",
        role: ["Admin", "Owner"],
        order: 3,
      },
      {
        name: "Appointments",
        path: "/appointments",
        icon: "bi bi-calendar-event",
        role: ["Admin", "Receptionist", "Doctor", "Owner"],
        order: 4,
      },
      {
        name: "Approvals",
        path: "/approvals",
        icon: "bi bi-check2-square",
        role: ["Admin", "Owner"],
        order: 5,
      },
      {
        name: "Doctors",
        path: "/doctors",
        icon: "bi bi-person-vcard",
        role: ["Admin", "Owner"],
        order: 6,
      },
      {
        name: "Health Records",
        path: "/health-records",
        icon: "bi bi-file-medical",
        role: ["Admin", "Doctor", "Owner"],
        order: 7,
      },
    ];

    await Node.insertMany(menus);
    console.log("Sidebar menus restored successfully");
  } catch (error) {
    console.error("Error restoring menus:", error);
  }
};

module.exports = seedMenus;
