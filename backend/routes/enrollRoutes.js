const express = require("express");
const enrollController = require("../controller/enrollController");
const authUserRole = require("../middleware/authUserRole");

const router = express.Router();

router.post('/enrollCourse', authUserRole.checkStudentRole, enrollController.enrollCourse);

router.get("/checkCoursesEnroll/:userId", authUserRole.checkStudentRole, enrollController.checkCoursesEnroll);

router.get("/checkCourseEnroll/:userId/:courseId", authUserRole.verifiedStudentEnrollCourse, enrollController.checkCourseEnroll)

module.exports = router;