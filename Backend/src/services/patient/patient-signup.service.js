const Patient = require("../../models/Patient");
const User = require("../../models/User");
const STATUS = require("../../constants/status");
const bcrypt = require("bcryptjs");

const generatePatientId = require("../../utils/generatePatientId");
const generateTemporaryPassword = require("../../utils/generateTemporaryPassword");
const sendEmail = require("../../utils/sendEmail");

const patientSignup = async (patientData) => {
  try {
    const {
      firstName,
      lastName,
      dateOfBirth,
      gender,
      phone,
      email,
      address,
      city,
      state,
      pincode,
      country,
      bloodGroup,
      maritalStatus,
      emergencyContactName,
      emergencyContactPhone,
      relationship,
    } = patientData;

    const existingUser = await User.findOne({
      email: email.toLowerCase(),
    });

    if (existingUser) {
      throw new Error("User already exists");
    }

    const existingPatient = await Patient.findOne({ phone });

    if (existingPatient) {
      throw new Error("Phone number already registered");
    }

    const temporaryPassword = generateTemporaryPassword();
    const hashedTemporaryPassword = await bcrypt.hash(temporaryPassword, 10);

    const patientId = await generatePatientId();

    const userDoc = new User({
      firstName,
      lastName,
      email: email.toLowerCase(),
      phone,
      passwordHash: null,
      temporaryPasswordHash: hashedTemporaryPassword,
      roles: ["PATIENT"],
      patientId,
      isFirstLogin: true,
      status: STATUS.ACTIVE,
    });

    const user = await userDoc.save();

    console.log("SAVED USER ROLES:", user.roles);
    console.log("USER ID:", user._id);
    const patient = await Patient.create({
      userId: user._id,
      patientId,
      firstName,
      lastName,
      dateOfBirth,
      gender,
      phone,
      email: email.toLowerCase(),
      address,
      city,
      state,
      pincode,
      country,
      bloodGroup,
      maritalStatus,
      emergencyContactName,
      emergencyContactPhone,
      relationship,
    });

    await sendEmail({
      to: email,
      subject: "Your HMS Patient Account Credentials",
      htmlContent: `
        <h2>Welcome ${firstName}</h2>
        <p>Your patient account has been created successfully.</p>
        <p><strong>Login Email:</strong> ${email}</p>
        <p><strong>Temporary Password:</strong> ${temporaryPassword}</p>
        <p>Please log in using this temporary password and reset your password immediately.</p>
        <br/>
        <p>Thank you,<br/>HMS System</p>
      `,
    });

    return {
      message: "Patient signup successful and credentials email sent",
      userId: user._id,
      patientId: patient.patientId,
      patient,
    };
  } catch (error) {
    throw error;
  }
};

module.exports = patientSignup;
