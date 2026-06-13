const { body } = require('express-validator');
const timeRegex = /^(0[1-9]|1[0-2]):[0-5]\d\s(AM|PM)$/;

const convertTimeToMinutes = (timeStr) => {
    const [time, period] = timeStr.split(' ');
    let [hours, minutes] = time.split(':').map(Number);

    if (period === 'PM' && hours !== 12) {
        hours += 12;
    }

    if (period === 'AM' && hours === 12) {
        hours = 0;
    }

    return hours * 60 + minutes;
};

const validateCreateDoctor = [
    body("firstName")
        .trim()
        .notEmpty()
        .withMessage("First Name is required"),

    body("lastName")
        .trim()
        .notEmpty()
        .withMessage("Last Name is required"),

    body("email")
        .isEmail()
        .withMessage("Not a valid Email"),

    body("password")
        .isStrongPassword()
        .withMessage("Enter a Strong Password"),

    body("phone")
        .isMobilePhone('en-IN')
        .withMessage("Enter a Valid Phone No"),

    body("department")
        .notEmpty()
        .withMessage("Department is required"),

    body("designation")
        .notEmpty()
        .withMessage("Designation is required"),

    body("joiningDate")
        .notEmpty()
        .withMessage("Joining Date is required")
        .isISO8601()
        .withMessage("Joining Date must be a valid date"),

    body("specialization")
        .notEmpty()
        .withMessage("Specialization is required"),

    body("qualification")
        .notEmpty()
        .withMessage("Qualification is required"),

    body("consultationFee")
        .notEmpty()
        .withMessage("Consultation fee is required")
        .isNumeric()
        .withMessage("Consultation fee must be a number"),

    body("medicalRegistrationNo")
        .notEmpty()
        .withMessage("Medical Registration Number is required"),

    body("availabilityStartTime")
        .notEmpty()
        .withMessage("Availability start time is required")
        .matches(timeRegex)
        .withMessage("Availability start time must be in format 09:00 AM"),


    body("availabilityEndTime")
        .notEmpty()
        .withMessage("Availability end time is required")
        .matches(timeRegex)
        .withMessage("Availability end time must be in format 05:00 PM")
        .custom((endTime, { req }) => {
            const startTime = req.body.availabilityStartTime;

            if (!startTime || !endTime) {
                return true;
            }

            if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
                return true;
            }
            //using if condition to skip if anything is wrong it will be captured in the validate middleware

            const start = convertTimeToMinutes(startTime);
            const end = convertTimeToMinutes(endTime);

            if (end <= start) {
                throw new Error("Availability end time must be after start time");
            }

            if (end - start < 60) {
                throw new Error("Availability must be at least 1 hour");
            }

            return true;
        }),

    body("experienceYears")
        .notEmpty()
        .withMessage("Experience years is required")
        .isNumeric()
        .withMessage("Experience years must be a number")
];
module.exports = { validateCreateDoctor };