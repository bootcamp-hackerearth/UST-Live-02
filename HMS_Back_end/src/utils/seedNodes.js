const Node = require("../models/Nodes");

// Default sidebar menu items; any that are missing from the database get recreated on boot.
// Array order is the seeding (creation) order, which drives sidebar order since nodes are
// listed by created_at ascending. Overview and Profile are rendered first by the sidebar
// itself (not seeded here), so the owner sees:
// Overview, Profile, Admins, Employees, Approvals, Patients, Appointments, Medical Records, Menu Nodes.
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

// Inserts any default node that is missing (matched by path) and NEVER updates an
// existing one. This preserves dashboard edits — name, icon, allowed designations —
// across restarts, while a deleted default is recreated on the next boot.
//
// Matching by path is safe against duplicates because the dashboard does not allow a
// node's path to be changed after creation (see nodeController.updateNode), so an
// existing default can never drift to a different path and get re-seeded as a clone.
//
// Assumes an active mongoose connection and throws on failure.
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
