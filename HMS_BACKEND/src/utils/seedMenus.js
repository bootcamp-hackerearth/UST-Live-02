const Node = require('../models/Node.model'); // adjust path if needed
 
const seedMenus = async () => {
  try {
    await Node.deleteMany();
 
    const menus = [
 
      // 🔹 Patients
      {
        name: "Patients",
        path: "/patients",
        icon: "bi bi-person-hearts",
        role: "Admin",
        order: 2
      },
      {
        name: "Patients",
        path: "/patients",
        icon: "bi bi-person-hearts",
        role: "Doctor",
        order: 2
      },
 
      // 🔹 Employees (Admin only)
      {
        name: "Employees",
        path: "/employees",
        icon: "bi bi-person-badge",
        role: "Admin",
        order: 3
      },
 
      // 🔹 Appointments
      {
        name: "Appointments",
        path: "/appointments",
        icon: "bi bi-calendar-event",
        role: "Admin",
        order: 4
      },
      {
        name: "Appointments",
        path: "/appointments",
        icon: "bi bi-calendar-event",
        role: "Doctor",
        order: 4
      },
      {
        name: "Appointments",
        path: "/appointments",
        icon: "bi bi-calendar-event",
        role: "Receptionist",
        order: 4
      },
 
      // 🔹 Approvals (Admin only)
      {
        name: "Approvals",
        path: "/approvals",
        icon: "bi bi-check2-square",
        role: "Admin",
        order: 5
      },
 
      // 🔹 Doctors (Admin only)
      {
        name: "Doctors",
        path: "/doctors",
        icon: "bi bi-person-vcard",
        role: "Admin",
        order: 6
      }
 
    ];
 
    await Node.insertMany(menus);
 
    console.log("✅ Sidebar menus seeded successfully");
 
  } catch (error) {
    console.error("❌ Error seeding menus:", error);
  }
};
 
module.exports = seedMenus;