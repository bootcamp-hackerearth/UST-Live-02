const { body } = require("express-validator");

const isFutureDate = (value) => {
  const selectedDate = new Date(value);
  const today = new Date();

  selectedDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  return selectedDate > today;
};

const notFutureDate = (fieldLabel) => (value) => {
  if (isFutureDate(value)) {
    throw new Error(`${fieldLabel} cannot be in the future`);
  }

  return true;
};

const requireDocumentFile = (message) => (_value, { req }) => {
  if (!req.file) {
    throw new Error(message);
  }

  return true;
};

const addLabReportValidation = [
  body("title").trim().notEmpty().withMessage("Title is required"),

  body("reportType").trim().notEmpty().withMessage("Report type is required"),

  body("reportDate")
    .notEmpty()
    .withMessage("Report date is required")
    .isISO8601()
    .withMessage("Invalid report date")
    .custom(notFutureDate("Report date")),

  body("document").custom(requireDocumentFile("Report file is required")),
];

const updateLabReportValidation = [
  body("title").optional({ checkFalsy: true }).trim(),

  body("reportType").optional({ checkFalsy: true }).trim(),

  body("reportDate")
    .optional({ checkFalsy: true })
    .isISO8601()
    .withMessage("Invalid report date")
    .custom(notFutureDate("Report date")),
];

const addMedicalDocumentValidation = [
  body("title").trim().notEmpty().withMessage("Title is required"),

  body("documentType")
    .trim()
    .notEmpty()
    .withMessage("Document type is required"),

  body("recordDate")
    .notEmpty()
    .withMessage("Record date is required")
    .isISO8601()
    .withMessage("Invalid record date")
    .custom(notFutureDate("Record date")),

  body("document").custom(requireDocumentFile("Document file is required")),
];

const updateMedicalDocumentValidation = [
  body("title").optional({ checkFalsy: true }).trim(),

  body("documentType").optional({ checkFalsy: true }).trim(),

  body("recordDate")
    .optional({ checkFalsy: true })
    .isISO8601()
    .withMessage("Invalid record date")
    .custom(notFutureDate("Record date")),
];

module.exports = {
  addLabReportValidation,
  updateLabReportValidation,
  addMedicalDocumentValidation,
  updateMedicalDocumentValidation,
};
