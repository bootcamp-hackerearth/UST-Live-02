const mongoose = require("mongoose");
require("dotenv").config();

async function fixDates() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to Atlas");

  const db = mongoose.connection.db;

  // Fix appointments.appointmentDate
  const appointments = await db.collection("appointments").find({}).toArray();
  let fixed = 0;

  for (const appt of appointments) {
    const updates = {};

    // Fix appointmentDate if it's a string
    if (typeof appt.appointmentDate === "string") {
      updates.appointmentDate = new Date(appt.appointmentDate);
    }

    if (Object.keys(updates).length > 0) {
      await db.collection("appointments").updateOne(
        { _id: appt._id },
        { $set: updates }
      );
      fixed++;
    }
  }

  console.log(`✅ Fixed ${fixed} appointments`);

  // Fix patients.dob if string
  const patients = await db.collection("patients").find({}).toArray();
  let fixedPatients = 0;

  for (const patient of patients) {
    const updates = {};

    if (typeof patient.dob === "string") {
      updates.dob = new Date(patient.dob);
    }

    if (Object.keys(updates).length > 0) {
      await db.collection("patients").updateOne(
        { _id: patient._id },
        { $set: updates }
      );
      fixedPatients++;
    }
  }

  console.log(`✅ Fixed ${fixedPatients} patients`);

  // Fix employees.joiningDate if string
  const employees = await db.collection("employees").find({}).toArray();
  let fixedEmployees = 0;

  for (const emp of employees) {
    const updates = {};

    if (typeof emp.joiningDate === "string") {
      updates.joiningDate = new Date(emp.joiningDate);
    }

    if (Object.keys(updates).length > 0) {
      await db.collection("employees").updateOne(
        { _id: emp._id },
        { $set: updates }
      );
      fixedEmployees++;
    }
  }

  console.log(`✅ Fixed ${fixedEmployees} employees`);

  // Fix medicalrecords dates
  const records = await db.collection("medicalrecords").find({}).toArray();
  let fixedRecords = 0;

  for (const rec of records) {
    const updates = {};

    if (typeof rec.created_at === "string") {
      updates.created_at = new Date(rec.created_at);
    }
    if (typeof rec.updated_at === "string") {
      updates.updated_at = new Date(rec.updated_at);
    }

    if (Object.keys(updates).length > 0) {
      await db.collection("medicalrecords").updateOne(
        { _id: rec._id },
        { $set: updates }
      );
      fixedRecords++;
    }
  }

  console.log(`✅ Fixed ${fixedRecords} medical records`);

  await mongoose.disconnect();
  console.log("\n🎉 All dates fixed successfully");
}

fixDates().catch(console.error);
