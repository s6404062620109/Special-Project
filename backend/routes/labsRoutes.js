const express = require("express");
const authUserRole = require("../middleware/authUserRole");
const labsController = require("../controller/labsController");

const router = express.Router();

router.get("/getLabQuestions/:courseId/:subjectId", authUserRole.verifiedStudentEnrollCourse, labsController.getLabQuestions);

router.post("/startLabSession/:courseId", authUserRole.verifiedStudentEnrollCourse, labsController.startLabSession);

router.post("/clearLabSession/:courseId", authUserRole.verifiedStudentEnrollCourse, labsController.clearLabSession);

router.put("/submitLabQuestions/:courseId/:enrollmentId", authUserRole.verifiedStudentEnrollCourse, labsController.submitLabQuestions);

module.exports = router;