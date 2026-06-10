const Employee = require("../../models/Employee");

const getDoctorsService =
  async () => {

    return Employee.find({
      designation: "DOCTOR",
    })
      .select(
        "name department specialization availability consultationFee"
      )
      .sort({
        name: 1,
      });
  };

module.exports =
  getDoctorsService;