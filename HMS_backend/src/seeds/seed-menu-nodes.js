require("dotenv").config();

const mongoose = require("mongoose");
const connectDB = require("../config/db");
const MenuNode = require("../models/MenuNode");

const parentMenus = [
  {
    key: "admin-dashboard",
    label: "Admin Dashboard",
    path: "/dashboard/admin",
    icon: "dashboard",
    allowedRoles: ["SUPER_ADMIN", "ADMIN"],
    order: 1,
  },
  {
    key: "doctor-dashboard",
    label: "Doctor Dashboard",
    path: "/dashboard/doctor",
    icon: "dashboard",
    allowedRoles: ["DOCTOR"],
    order: 1,
  },
  {
    key: "receptionist-dashboard",
    label: "Receptionist Dashboard",
    path: "/dashboard/receptionist",
    icon: "dashboard",
    allowedRoles: ["RECEPTIONIST"],
    order: 1,
  },
  {
    key: "employees",
    label: "Employees",
    path: "group:employees",
    icon: "users",
    allowedRoles: ["SUPER_ADMIN", "ADMIN"],
    order: 2,
  },
  {
    key: "patients",
    label: "Patients",
    path: "group:patients",
    icon: "patients",
    allowedRoles: ["SUPER_ADMIN", "ADMIN", "DOCTOR", "RECEPTIONIST"],
    order: 3,
  },
  {
    key: "appointments",
    label: "Appointments",
    path: "group:appointments",
    icon: "calendar",
    allowedRoles: ["SUPER_ADMIN", "ADMIN", "DOCTOR", "RECEPTIONIST"],
    order: 4,
  },
  {
    key: "doctor-queue",
    label: "Doctor Queue",
    path: "/doctor-queue",
    icon: "queue",
    allowedRoles: ["DOCTOR"],
    order: 5,
  },
  {
    key: "doctor-availability",
    label: "Availability",
    path: "/doctor-availability",
    icon: "clock",
    allowedRoles: ["DOCTOR"],
    order: 6,
  },
  {
    key: "medical-records",
    label: "Medical Records",
    path: "/medical-records",
    icon: "file-text",
    allowedRoles: ["SUPER_ADMIN", "ADMIN", "DOCTOR", "RECEPTIONIST"],
    order: 7,
  },
  {
    key: "profile",
    label: "My Profile",
    path: "/my-profile",
    icon: "user-circle",
    allowedRoles: ["SUPER_ADMIN", "ADMIN", "DOCTOR", "RECEPTIONIST"],
    order: 8,
  },
];

const childMenus = [
  {
    parentKey: "employees",
    label: "All Employees",
    path: "/employees",
    icon: "list",
    allowedRoles: ["SUPER_ADMIN", "ADMIN"],
    order: 1,
  },
  {
    parentKey: "employees",
    label: "New Employee",
    path: "/employees/create",
    icon: "user-plus",
    allowedRoles: ["SUPER_ADMIN", "ADMIN"],
    order: 2,
  },
  {
    parentKey: "employees",
    label: "Requests",
    path: "/employees/pending",
    icon: "inbox",
    allowedRoles: ["SUPER_ADMIN", "ADMIN"],
    order: 3,
  },
  {
    parentKey: "patients",
    label: "All Patients",
    path: "/patients",
    icon: "list",
    allowedRoles: ["SUPER_ADMIN", "ADMIN", "DOCTOR", "RECEPTIONIST"],
    order: 1,
  },
  {
    parentKey: "patients",
    label: "New Patient",
    path: "/patients/create",
    icon: "user-plus",
    allowedRoles: ["SUPER_ADMIN", "ADMIN", "RECEPTIONIST"],
    order: 2,
  },
  {
    parentKey: "appointments",
    label: "All Appointments",
    path: "/appointments",
    icon: "calendar-days",
    allowedRoles: ["SUPER_ADMIN", "ADMIN", "DOCTOR", "RECEPTIONIST"],
    order: 1,
  },
  {
    parentKey: "appointments",
    label: "New Appointment",
    path: "/appointments/book",
    icon: "calendar-plus",
    allowedRoles: ["SUPER_ADMIN", "ADMIN", "RECEPTIONIST"],
    order: 2,
  },
  {
    parentKey: "appointments",
    label: "Requests",
    path: "/appointments/requests",
    icon: "inbox",
    allowedRoles: ["SUPER_ADMIN", "ADMIN"],
    order: 3,
  },
];

const seedMenuNodes = async () => {
  await connectDB();

  const parentNodeMap = new Map();

  for (const menuNode of parentMenus) {
    const savedNode = await MenuNode.findOneAndUpdate(
      { path: menuNode.path },
      {
        label: menuNode.label,
        path: menuNode.path,
        parentId: null,
        icon: menuNode.icon,
        allowedRoles: menuNode.allowedRoles,
        order: menuNode.order,
        isActive: true,
      },
      {
        upsert: true,
        returnDocument: "after",
      }
    );

    parentNodeMap.set(menuNode.key, savedNode);
  }

  for (const menuNode of childMenus) {
    const parentNode = parentNodeMap.get(menuNode.parentKey);

    await MenuNode.findOneAndUpdate(
      { path: menuNode.path },
      {
        label: menuNode.label,
        path: menuNode.path,
        parentId: parentNode?._id || null,
        icon: menuNode.icon,
        allowedRoles: menuNode.allowedRoles,
        order: menuNode.order,
        isActive: true,
      },
      {
        upsert: true,
        returnDocument: "after",
      }
    );
  }

  await MenuNode.findOneAndUpdate(
    { path: "/consultations" },
    { isActive: false }
  );
  await MenuNode.deleteMany({
    path: {
      $in: ["/menu/employees", "/menu/patients", "/menu/appointments"],
    },
  });

  console.log("Menu nodes seeded successfully");
  await mongoose.connection.close();
};

const main = async () => {
  try {
    await seedMenuNodes();
  } catch (error) {
    console.error("Menu node seed failed", error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

main();

