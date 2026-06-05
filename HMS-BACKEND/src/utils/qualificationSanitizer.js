/**
 * Sanitizes the qualifications array by trimming spaces, removing empty strings, and eliminating duplicates
 * @param {Array<string>} qualifications - The array of qualification strings
 * @returns {Array<string>} The sanitized array of qualification strings
 */
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