/**
*  Sanitizes a list of qualifications by trimming spaces, removing empty strings, and eliminating duplicates
* @param {Array<string>} qualifications - The list of qualification strings
* @returns {Array<string>} The sanitized list of qualifications
**/
const sanitizeQualifications = (qualifications = []) => {
  // Trim spaces
  const trimmedQualifications = qualifications.map((qualification) =>
    qualification.trim(),
  );

  // Remove empty strings
  const nonEmptyQualifications = trimmedQualifications.filter(
    (qualification) => qualification.length > 0,
  );

  // Remove duplicates
  const uniqueQualifications = [...new Set(nonEmptyQualifications)];

  return uniqueQualifications;
};

module.exports = sanitizeQualifications;