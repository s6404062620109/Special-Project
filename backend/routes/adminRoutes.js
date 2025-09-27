const express = require("express");
const multer = require('multer');
const path = require("path");
const authUserRole = require("../middleware/authUserRole");
const adminController = require("../controller/adminController");

const router = express.Router();

router.get("/getUsers", authUserRole.checkAdminRole, adminController.getUsers);

router.post("/addUser", authUserRole.checkAdminRole, adminController.addUser);

router.delete("/deleteUser/:userId", authUserRole.checkAdminRole, adminController.deleteUser);

router.put("/updateUser/:userId", authUserRole.checkAdminRole, adminController.updateUser);

router.get("/getCourses", authUserRole.checkAdminRole, adminController.getCourses);

router.delete("/deleteCourse/:courseId", authUserRole.checkAdminRole, adminController.deleteCourse);

router.put("/approveTeacherReq/:userId", authUserRole.checkAdminRole, adminController.approveTeacherReq);

const Upload = multer({ 
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

router.use("/guide/student", express.static(path.join(__dirname, '../courses/guide/student')));
router.use("/guide/teacher", express.static(path.join(__dirname, '../courses/guide/teacher')));

router.get("/getGuide", authUserRole.checkAdminRole, adminController.getGuides);

router.post("/updateGuide", authUserRole.checkAdminRole, Upload.any(), adminController.updateGuide);

module.exports = router;