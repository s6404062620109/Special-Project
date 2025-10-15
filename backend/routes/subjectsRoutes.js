const express = require("express");
const path = require("path");
const subjectController = require("../controller/subjectController");
const authUserRole = require("../middleware/authUserRole");

const router = express.Router();

router.use('/courses', express.static(path.join(__dirname, '../courses')));

router.get("/getAllSubject/:courseId", authUserRole.checkCourseCreation, subjectController.getAll);

router.get("/getAllSubjectStudent/:courseId", authUserRole.checkStudentRole, subjectController.getAllSubjectStudent);

router.get("/getSubject/:courseId/:subjectId", authUserRole.verifiedStudentEnrollCourse, subjectController.getSubject);


module.exports = router;
