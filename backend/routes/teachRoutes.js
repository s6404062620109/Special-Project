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

router.get("/getQuestionType", authUserRole.checkTeacherRole, teacherController.getQuestionType);

const NoneFileMulter = multer();

const subjectUpload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 16 * 1024 * 1024 },
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