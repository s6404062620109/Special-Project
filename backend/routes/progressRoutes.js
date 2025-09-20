const express = require("express");
const progressController = require("../controller/progressController");
const authUserRole = require("../middleware/authUserRole");

const router = express.Router();

router.get("/checkCourseProgress/:enrollmentId/:courseId", authUserRole.verifiedStudentEnrollCourse, progressController.checkProgress);
  
router.get("/getLatestProgress/:enrollmentId/:courseId", authUserRole.verifiedStudentEnrollCourse, progressController.getLatest);

router.get("/getAllProgressAnswers/:enrollmentId/:courseId", authUserRole.verifiedStudentEnrollCourse, progressController.getAllProgressAnswers);

module.exports = router;