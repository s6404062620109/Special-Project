const express = require("express");
const posttestController = require("../controller/posttestController");
const authUserRole = require("../middleware/authUserRole");

const router = express.Router();

router.get("/getPosttest/:enrollmentId/:courseId", authUserRole.verifiedStudentEnrollCourse, posttestController.getPosttest);
  
router.put("/submitPosttest/:courseId", authUserRole.verifiedStudentEnrollCourse, posttestController.submitPosttest);

module.exports = router;