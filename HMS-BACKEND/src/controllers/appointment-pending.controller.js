const Appointment = require("../models/Appointment");

const getPendingAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({
      approvalStatus: "PENDING",
    })
      .populate("patientId")
      .populate("doctorEmployeeId");

    res.status(200).json({
      success: true,
      data: appointments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = { getPendingAppointments };
