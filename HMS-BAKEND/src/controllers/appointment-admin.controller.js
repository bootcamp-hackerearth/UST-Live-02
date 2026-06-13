const adminUpdateService = require("../services/appointment/appointment-admin.service");

const adminUpdate = async (req, res) => {
  try {
    const appointment = await adminUpdateService(req.params.id, req.body);

    res.json({
      success: true,
      message: "Appointment updated by admin",
      data: appointment,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { adminUpdate };
