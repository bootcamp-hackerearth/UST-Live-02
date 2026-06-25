const Node = require("../models/Nodes");
const Employee = require("../models/Employees");
const Counter = require("../models/Counter");
const AppError = require("../utils/AppError");
const { sendSuccess } = require("../utils/apiResponse");
const parsePagination = require("../utils/parsePagination");
const recordAudit = require("../utils/recordAudit");
const resolveActor = require("../utils/resolveActor");
const STATUS = require("../constants/statusCodes");
const MESSAGES = require("../constants/messages");

// Escapes user input so it can be used safely inside a RegExp
const escapeRegex = (value) => value.replaceAll(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`);

// List sidebar nodes with optional search + pagination (OWNER management page)
exports.getNodes = async (req, res) => {

    const { page, limit, skip } = parsePagination(req.query, 10);

    const filter = {};

    if (req.query.search?.trim()) {
        const regex = new RegExp(escapeRegex(req.query.search.trim()), "i");
        filter.$or = [
            { name: regex },
            { path: regex },
            { nodeId: regex }
        ];
    }

    const [nodes, total] = await Promise.all([
        Node.find(filter)
            .select("-_id -__v")
            .sort({ created_at: 1 })
            .skip(skip)
            .limit(limit),
        Node.countDocuments(filter)
    ]);

    return sendSuccess(res, STATUS.OK, MESSAGES.NODE.LIST_RETRIEVED, {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        totalNodes: total,
        nodes
    });
};

// Create node
exports.createNode = async (req, res) => {

    const {
        name,
        path,
        icon,
        allowedDesignations
    } = req.body;

    // Check duplicate path
    const existingNode = await Node.findOne({ path });

    if (existingNode) {
        throw new AppError(STATUS.CONFLICT, MESSAGES.NODE.PATH_EXISTS);
    }

    // Save the node to mongodb
    const node = await Node.create({
        name,
        path,
        icon,
        allowedDesignations
    });

    // Log the creation
    const actor = await resolveActor(req.user);
    await recordAudit({
        actor,
        action: "NODE_CREATED",
        targetType: "NODE",
        targetId: node.nodeId,
        ipAddress: req.ip,
        message: MESSAGES.AUDIT.NODE_CREATED(node.name, node.nodeId)
    });

    return sendSuccess(res, STATUS.CREATED, MESSAGES.NODE.CREATED, {
        node
    });
};

// Update node
exports.updateNode = async (req, res) => {

    // path is intentionally NOT destructured/updated: a node's path is immutable once
    // created. Keeping it fixed guarantees seedNodes (which matches defaults by path)
    // can never create a duplicate of an existing node.
    const {
        name,
        icon,
        allowedDesignations
    } = req.body;

    const updateData = {};

    if (name !== undefined) {
        updateData.name = name;
    }

    if (icon !== undefined) {
        updateData.icon = icon;
    }

    if (allowedDesignations !== undefined) {
        updateData.allowedDesignations = allowedDesignations;
    }

    const updatedNode = await Node.findOneAndUpdate(
        {
            nodeId: req.params.nodeId
        },

        updateData,

        {
            new: true,
            runValidators: true
        }
    );

    if (!updatedNode) {
        throw new AppError(STATUS.NOT_FOUND, MESSAGES.NODE.NOT_FOUND);
    }

    // Log the update
    const actor = await resolveActor(req.user);
    await recordAudit({
        actor,
        action: "NODE_UPDATED",
        targetType: "NODE",
        targetId: updatedNode.nodeId,
        ipAddress: req.ip,
        message: MESSAGES.AUDIT.NODE_UPDATED(updatedNode.name, updatedNode.nodeId)
    });

    return sendSuccess(res, STATUS.OK, MESSAGES.NODE.UPDATED, {
        node: updatedNode
    });
};

// Delete node
exports.deleteNode = async (req, res) => {

    const deletedNode =
        await Node.findOneAndDelete({
            nodeId: req.params.nodeId
        });

    if (!deletedNode) {
        throw new AppError(STATUS.NOT_FOUND, MESSAGES.NODE.NOT_FOUND);
    }

    // Unlike employees/patients/appointments/medical records — whose counters always
    // move forward — node IDs are kept gapless and sequential. After a delete, renumber
    // the remaining nodes 1..N (in creation order) and roll the counter back to N so the
    // next created node continues the sequence with no gaps.
    //
    // nodeId is zero-padded, so a lexical sort on nodeId equals a numeric sort. Walking
    // ascending guarantees each target slot is already free, so the unique index on
    // nodeId never collides mid-renumber.
    const remainingNodes = await Node.find({}).sort({ nodeId: 1 });

    let seq = 0;
    for (const node of remainingNodes) {
        seq += 1;
        const newNodeId = `NODE-${String(seq).padStart(6, "0")}`;

        if (String(node.nodeId) !== newNodeId) {
            node.nodeId = newNodeId;
            await node.save();
        }
    }

    // Reset the counter to the new highest sequence (0 when no nodes remain)
    await Counter.findOneAndUpdate(
        { name: "nodes" },
        { $set: { seq } },
        { upsert: true }
    );

    // Log the deletion (uses the node's original id, captured before renumbering)
    const actor = await resolveActor(req.user);
    await recordAudit({
        actor,
        action: "NODE_DELETED",
        targetType: "NODE",
        targetId: deletedNode.nodeId,
        ipAddress: req.ip,
        message: MESSAGES.AUDIT.NODE_DELETED(deletedNode.name, deletedNode.nodeId)
    });

    return sendSuccess(res, STATUS.OK, MESSAGES.NODE.DELETED);
};

// Get sidebar nodes
exports.getMyNodes = async (req, res) => {

    const employee = await Employee.findOne({
        employeeCode: req.user.employeeCode
    });

    if (!employee) {
        throw new AppError(STATUS.NOT_FOUND, MESSAGES.EMPLOYEE.NOT_FOUND);
    }

    const designation = employee.designation;

    const nodes = await Node.find({

        allowedDesignations: designation

    })
        .select("-_id -__v")
        .sort({ created_at: 1 });

    return sendSuccess(res, STATUS.OK, MESSAGES.NODE.LIST_RETRIEVED, {
        totalNodes: nodes.length,
        nodes
    });
};
