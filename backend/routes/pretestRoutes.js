const express = require("express");
const pretestController = require("../controller/pretestController");
const authUserRole = require("../middleware/authUserRole");

const router = express.Router();

router.get("/getPretest/:enrollmentId/:courseId", authUserRole.verifiedStudentEnrollCourse, pretestController.getPretest);

router.put("/submitPretest/:courseId", authUserRole.verifiedStudentEnrollCourse, pretestController.submitPretest);

module.exports = router;
