const express = require("express");
const multer = require('multer');
const path = require("path");
const fs = require("fs");
const db = require("../database");
const teacherController = require("../controller/teacherController");
const authUserRole = require("../middleware/authUserRole");

const router = express.Router();

router.use(express.json());
router.use(express.urlencoded({ extended: true }));

router.get("/getMyCourses/:userId", authUserRole.checkTeacherRole, teacherController.getMyCourses);

router.get("/courseTestProgress/:courseId", authUserRole.verifiedTeacherCourse, teacherController.courseTestProgress);

router.post("/addCourse", authUserRole.checkTeacherRole, teacherController.createCourse);

router.put("/update/:courseId", authUserRole.verifiedTeacherCourse, teacherController.updateCourse);

router.delete("/deleteCourse/:courseId/:userId", authUserRole.verifiedTeacherCourse, teacherController.deleteCourse);

router.get("/getSubject/:courseId/:subjectId", authUserRole.verifiedTeacherCourse, teacherController.getSubject);

const NoneFileMulter = multer();

router.post("/addSubject/:courseId", authUserRole.verifiedTeacherCourse, NoneFileMulter.none(), teacherController.addManualSubject);

const pdfStorage = multer.memoryStorage(); 
const pdfUpload = multer({ 
  storage: pdfStorage,
  limits: { fileSize: 16 * 1024 * 1024 }, 
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed!'), false);
    }
  }
});

router.post("/addPdfSubject/:courseId", authUserRole.verifiedTeacherCourse, pdfUpload.single("file"), teacherController.addPdfSubject);

router.put("/updateSubject/:courseId/:subjectId", authUserRole.verifiedTeacherCourse, NoneFileMulter.none(),teacherController.editManualSubject);

router.put("/updatePdfSubject/:courseId/:subjectId", authUserRole.verifiedTeacherCourse, pdfUpload.single("file"), teacherController.editPdfSubject);

router.delete("/deleteSubjectOnCourse/:courseId/:subjectId/:userId", authUserRole.verifiedTeacherCourse, teacherController.deleteSubject);

module.exports = router;