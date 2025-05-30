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

function deleteFolderRecursive(folderPath){
  if (fs.existsSync(folderPath)) {
    fs.rmSync(folderPath, { recursive: true, force: true });
    console.log(`Deleted folder: ${folderPath}`);
  } else {
    console.log(`Folder does not exist: ${folderPath}`);
  }
};

router.delete("/deleteSubjectOnCourse/:courseId/:subjectId/:userId", (req, res) => {
  const { courseId, subjectId, userId } = req.params;

  if(!courseId || !subjectId || !userId){
    return res.status(400).send({ message: "Course ID, Subject ID and User ID are required." });
  }

  db.query("SELECT id FROM course WHERE id = ? AND teacherId = ?", [courseId, userId], (error, result) => {
    if(error){
      console.log(error);
      return res.status(500).json({ message: "Database course query error." });
    }
    
    if(result.length === 0){
      return res.status(404).json({ message: "Course not found or you do not have permission." });
    }

    if(result.length > 0){
      db.query("SELECT id FROM subject WHERE id = ? AND courseId = ?", 
        [subjectId, courseId, userId], (error, result) => {
          if(error){
            console.log(error);
            return res.status(500).json({ message: "Database subject query error." });
          }
    
          if(result.length === 0){
            return res.status(404).json({ message: "Subject not found or you do not have permission to delete this subject." });
          }
    
          if(result.length > 0){
  
            db.query("DELETE FROM subject WHERE id = ? AND courseId = ?",
              [subjectId, courseId], (error) => {
                if(error){
                  console.log(error);
                  return res.status(500).json({ message: "Delete subject from database error." });
                }
    
                const subjectFolderPath = path.join(__dirname, `../courses/c${courseId}/s${subjectId}`);
                deleteFolderRecursive(subjectFolderPath);

                return res.status(200).json({ message: "Subject deleted successfully." });
              }
            );
          }
        }
      );
    }
  });
  
});

module.exports = router;