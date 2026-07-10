const mongoose = require("mongoose");

const AuditLog = require("../../models/AuditLog");
const logger = require("../../utils/logger");

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

const normalizeObjectId = (value) =>
  value && isValidObjectId(value) ? value : null;

const getRequestIp = (req) => {
  const forwardedFor = req.headers?.["x-forwarded-for"];

  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }

  return req.ip || req.socket?.remoteAddress || null;
};

const getPerformedBy = (req) =>
  normalizeObjectId(req.user?.userId || req.user?._id || req.user?.id);

const getPerformedByRole = (req) =>
  Array.isArray(req.user?.roles) ? req.user.roles : [];

const writeAuditLog = async ({
  action,
  module: auditModule,
  performedBy = null,
  performedByRole = [],
  entityId = null,
  entityType,
  requestId = null,
  ipAddress = null,
  status = "SUCCESS",
  details = {},
}) =>
  AuditLog.create({
    action,
    module: auditModule,
    performedBy: normalizeObjectId(performedBy),
    performedByRole,
    entityId: normalizeObjectId(entityId),
    entityType,
    requestId,
    ipAddress,
    status,
    details,
  });

const auditFromRequest = (req, auditData) =>
  writeAuditLog({
    ...auditData,
    performedBy: getPerformedBy(req),
    performedByRole: getPerformedByRole(req),
    requestId: req.requestId,
    ipAddress: getRequestIp(req),
  });

const auditFromRequestSafe = (req, auditData) => {
  auditFromRequest(req, auditData).catch((error) => {
    logger.warn("Audit log write failed", {
      requestId: req.requestId,
      action: auditData.action,
      module: auditData.module,
      entityId: auditData.entityId,
      error,
    });
  });
};

module.exports = {
  auditFromRequest,
  auditFromRequestSafe,
  writeAuditLog,
};
