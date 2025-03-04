const express = require("express");
const multer = require('multer');
const path = require("path");
const fs = require("fs");
const db = require("./database");

const router = express.Router();

router.get("/getMyCourses/:userId", (req, res) => {
    const { userId } = req.params;

    if( typeof userId !== 'string' ){
        return res.status(400).send({ message: "Invalid user ID." });
    }

    db.query("SELECT * FROM course WHERE teacherId = ?", [userId], (error, result) => {
        if(error){
            console.log(error);
            return res.status(500).send({ message: "Database user query error." });
        }

        return res.status(200).send({ result });
    });
});

const createFolder = (folderPath) => {
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const { courseId } = req.params;

    if (!courseId) {
      return cb(new Error("Course ID is required"), null);
    }

    const uploadPath = path.join(__dirname, `../courses/c${courseId}`);
    createFolder(uploadPath);

    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

router.post("/uploadCourseIcon/:courseId", upload.single("icon"), (req, res) => {
  const { courseId } = req.params;
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  const iconFileName = req.file.filename;

  db.query("UPDATE course SET icon_id = ? WHERE id = ?", [iconFileName, courseId], (err) => {
    if (err) {
      console.error("Database update error:", err);
      return res.status(500).json({ message: "Database update error" });
    }

    res.status(200).json({ message: "Icon uploaded successfully", icon: iconFileName });
  });
});

router.post("/addCourse", async (req, res) => {
  try {
    const { name, teacherId } = req.body;

    if (!name || !teacherId) {
      return res.status(400).json({ message: "Course name and teacher ID are required" });
    }

    db.query("INSERT INTO course (name, teacherId) VALUES (?, ?)", [name, teacherId], (err, result) => {
      if (err) {
        console.error("Database query error:", err);
        return res.status(500).json({ message: "Database query error" });
      }

      return res.status(200).json({
        message: "Course added successfully",
        course: { id: result.insertId, name, teacherId, icon: null },
      });
    });
  } catch (error) {
    console.error("Error adding course:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

router.delete("/deleteCourse/:courseId/:userId", (req, res) => {
    const { courseId, userId } = req.params;

    if( typeof courseId !== 'string' || typeof userId !== 'string' ){
        return res.status(400).send({ message: "Invalid User ID or Course ID." });
    }

    db.query("SELECT id FROM course WHERE id = ? AND teacherId = ?", [ courseId, userId ], (error, result) => {
        if(error){
            console.log(error);
            return res.status(500).send({ message: "Database user query error." });
        }

        if(result.length === 0){
            return res.status(404).send({ message: "Course not found or you do not have permission to delete this course." });
        }

        db.query("DELETE FROM course WHERE id = ?", [courseId], (error) => {
            if(error){
                console.log(error);
                return res.status(500).send({ message: "Database course query error." });
            }
            
            const coursePath = path.join(__dirname, `../courses/c${courseId}`);
            if (fs.existsSync(coursePath)) {
                fs.rmSync(coursePath, { recursive: true, force: true });
            }
            
            return res.status(200).send({ message: "Course deleted successfully."});
        });
    });
    
});

module.exports = router;