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

router.get("/getMyCourses/:userId", authUserRole.checkCourseCreation, teacherController.getMyCourses);

router.get("/progressAnalysis/:courseId", authUserRole.verifiedTeacherCourse, teacherController.progressAnalysis);

router.post("/addCourse", authUserRole.checkCourseCreation, teacherController.createCourse);

router.put("/update/:courseId", authUserRole.verifiedTeacherCourse, teacherController.updateCourse);

router.delete("/deleteCourse/:courseId/:userId", authUserRole.verifiedTeacherCourse, teacherController.deleteCourse);

router.get("/sumEnrollments/:courseId", authUserRole.verifiedTeacherCourse, teacherController.enrollSummary);

router.get("/getSubject/:courseId/:subjectId", authUserRole.verifiedTeacherCourse, teacherController.getSubject);

router.get("/getQuestionType", authUserRole.checkCourseCreation, teacherController.getQuestionType);

const subjectUpload = multer({ 
  storage: multer.memoryStorage(),
  limits: { 
    fileSize: 16 * 1024 * 1024,
    fieldSize: 32 * 1024 * 1024 
  },
  fileFilter: (req, file, cb) => {
    const allowedExtensions = ['.pdf', '.sh', '.txt', '.png', '.jpg', '.jpeg', '.html', '.css', '.js'];

    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedExtensions.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file extension: ${ext}`), false);
    }
  }
});

router.post("/addSubject/:courseId", authUserRole.verifiedTeacherCourse, subjectUpload.any(), teacherController.addManualSubject);

router.post("/addPdfSubject/:courseId", authUserRole.verifiedTeacherCourse, subjectUpload.any(), teacherController.addPdfSubject);

router.put("/updateSubject/:courseId/:subjectId", authUserRole.verifiedTeacherCourse, subjectUpload.any(),teacherController.editManualSubject);

router.put("/updatePdfSubject/:courseId/:subjectId", authUserRole.verifiedTeacherCourse, subjectUpload.any(), teacherController.editPdfSubject);

router.delete("/deleteSubjectOnCourse/:courseId/:subjectId/:userId", authUserRole.verifiedTeacherCourse, teacherController.deleteSubject);

module.exports = router;