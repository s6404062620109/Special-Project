const express = require("express");
const enrollController = require("../controller/enrollController");
const authUserRole = require("../middleware/authUserRole");

const router = express.Router();

router.post('/enrollCourse', authUserRole.checkStudentRole, enrollController.enrollCourse);

router.put("/enrollCancel/:enrollmentId/:courseId", authUserRole.verifiedStudentEnrollCourse, enrollController.enrollCancel);

router.get("/checkCoursesEnroll/:userId", authUserRole.checkStudentRole, enrollController.checkCoursesEnroll);

router.get("/checkCourseEnroll/:userId/:courseId/:enrollmentId", authUserRole.verifiedStudentEnrollCourse, enrollController.checkCourseEnroll);

router.get("/getLatestEnrollment/:userId/:courseId", authUserRole.checkStudentRole, enrollController.getLatestEnrollment);

module.exports = router;