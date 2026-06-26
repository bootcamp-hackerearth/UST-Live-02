const Node = require("../models/Nodes");

// Default sidebar nodes recreated on boot when missing where array order sets the sidebar order by creation time
const DEFAULT_NODES = [
    {
        name: "Admins",
        path: "/dashboard/admins",
        icon: "shield",
        allowedDesignations: ["OWNER"]
    },
    {
        name: "Employees",
        path: "/dashboard/employees",
        icon: "users",
        allowedDesignations: ["OWNER", "ADMIN"]
    },
    {
        name: "Approvals",
        path: "/dashboard/approvals",
        icon: "check-circle",
        allowedDesignations: ["OWNER", "ADMIN"]
    },
    {
        name: "Patients",
        path: "/dashboard/patients",
        icon: "user",
        allowedDesignations: ["OWNER", "ADMIN", "RECEPTIONIST"]
    },
    {
        name: "Appointments",
        path: "/dashboard/appointments",
        icon: "calendar",
        allowedDesignations: ["OWNER", "ADMIN", "RECEPTIONIST", "DOCTOR"]
    },
    {
        name: "Medical Records",
        path: "/dashboard/medical-records",
        icon: "file-text",
        allowedDesignations: ["OWNER", "ADMIN", "RECEPTIONIST", "DOCTOR"]
    },
    {
        // Owner-only page for managing the sidebar menu nodes themselves
        name: "Menu Nodes",
        path: "/dashboard/menu-nodes",
        icon: "menu",
        allowedDesignations: ["OWNER"]
    }
];

// Inserts missing default nodes matched by their immutable path and never updates existing ones so dashboard edits survive restarts
const seedNodes = async () => {
    let created = 0;
    let skipped = 0;

    for (const nodeData of DEFAULT_NODES) {
        const existing = await Node.findOne({ path: nodeData.path });

        if (existing) {
            skipped += 1;
            continue;
        }

        // Use save() instead of create() so the pre-save hook assigns nodeId
        const node = new Node(nodeData);
        await node.save();
        created += 1;
    }

    console.log(`Nodes seeded. Created: ${created}, Skipped: ${skipped}`);
};

module.exports = seedNodes;
