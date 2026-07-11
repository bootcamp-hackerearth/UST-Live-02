const express = require('express');
const router = express.Router();

const joinUsController = require('../controller/joinUs.controller');

const {  validateCreateJoinUs} = require('../validation/joinUs.validation');
const authMiddleware=require('../middleware/authMiddleware')
const authRoles=require('../middleware/authRoles')

const permissions = require('../utils/permissions');
router.post(
    '/check-email',
    joinUsController.checkJoinUsEmail
);

router.post(
    '/create',
    validateCreateJoinUs,
    // validateRequest,
    joinUsController.createJoinUsRequest
);


router.get(
    '/verify/:token',
    joinUsController.verifyJoinUsEmail
);


router.get(
    '/pending',
    authMiddleware,
    authRoles(permissions.PENDING_APPROVE_EMPLOYEE),
    joinUsController.getPendingJoinUsRequests
);

router.get(
    '/list',
     authMiddleware,
    authRoles(permissions.PENDING_APPROVE_EMPLOYEE),
    joinUsController.getAllJoinUsRequests
);
router.put(
    '/approve/:requestId',
    authMiddleware,
    authRoles(permissions.APPROVE_EMPLOYEE),
    joinUsController.approveJoinUsRequest
);

router.put(
    '/reject/:requestId',
    authMiddleware,
    authRoles(permissions.APPROVE_EMPLOYEE), 
    joinUsController.rejectJoinUsRequest
);

module.exports = router;