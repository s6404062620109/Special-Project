const express = require("express");
const authUserRole = require("../middleware/authUserRole");
const adminController = require("../controller/adminController");

const router = express.Router();

router.get("/getUsers", authUserRole.checkAdminRole, adminController.getUsers);

router.post("/addUser", authUserRole.checkAdminRole, adminController.addUser);

router.delete("/deleteUser/:userId", authUserRole.checkAdminRole, adminController.deleteUser);

router.put("/updateUser/:userId", authUserRole.checkAdminRole, adminController.updateUser);

router.get("/getCourses", authUserRole.checkAdminRole, adminController.getCourses);

module.exports = router;