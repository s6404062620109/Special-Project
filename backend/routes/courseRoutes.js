const express = require("express");
const fs = require("fs");
const path = require("path"); 
const db = require("../database");
const courseController = require("../controller/courseController");

const router = express.Router();

router.get("/getCourses", courseController.getCourses);

router.get("/getEnrollmentCourses/:courseIds", courseController.getEnrollmentCourses);

module.exports = router;
