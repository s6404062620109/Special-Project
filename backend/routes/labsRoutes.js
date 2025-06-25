const express = require("express");
const path = require("path");
const authUserRole = require("../middleware/authUserRole");
const labsController = require("../controller/labsController");

const router = express.Router();

router.use("/lab", express.static(path.join(__dirname, "../lab")));

router.get("/getLabQuestions/:courseId", authUserRole.verifiedStudentEnrollCourse, labsController.getLabQuestions);

module.exports = router;