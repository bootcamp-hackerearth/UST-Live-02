const express = require('express');

const router = express.Router();
const userController=require('../controller/user.controller')
const authMiddleware=require('../middleware/authMiddleware')
const authRoles=require('../middleware/authRoles')
const permissions=require('../utils/permissions')
const userValidator=require('../validation/user.validation')
const validate=require('../middleware/validate')


router.post('/create',
    authMiddleware,
    authRoles(permissions.ADD_EMPLOYEE),
    userValidator.validateCreateEmployeeByAdmin,
    validate,
    userController.createEmployeeByAdmin);

router.get("/profile", 
    authMiddleware, 
userController.getCurrentProfile);


//to get the view of the employees 
router.get(
    '/list',
    authMiddleware,
    authRoles(permissions.VIEW_EMPLOYEE),
    userController.getAllEmployees
)

router.put(
  "/update/:employeeId",
  authMiddleware,
  authRoles(permissions.UPDATE_EMPLOYEE),
  userController.updateEmployee
);

router.delete(
  '/delete/:employeeId',
  authMiddleware,
  authRoles(permissions.DELETE_EMPLOYEE),
  userController.softDeleteEmployee
);

module.exports = router;




