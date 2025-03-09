const express = require("express");
const fs = require("fs");
const path = require("path"); 
const db = require("./database");

const router = express.Router();

router.get("/getCourses", (req, res) => {
  db.query("SELECT * FROM course", (err, courses) => {
    if (err) {
      return res.status(500).send({ message: "Database course query error" });
    } 
    
    if (courses.length === 0) {
      return res.status(200).send([]);
    }

    const courseIds = courses.map(course => course.id);

    db.query("SELECT * FROM subject WHERE courseId IN (?)", [courseIds], (err, subjects) => {
      if (err) {
        return res.status(500).send({ message: "Database subject query error" });
      } 

      const filteredCourses = courses.filter(course => 
        subjects.some(subject => subject.courseId === course.id)
      );

      return res.status(200).send(filteredCourses);
    });
  });
});

router.get("/getEnrollmentCourses/:courseIds", (req, res) => {
  const { courseIds } = req.params;

  if (!courseIds) {
    return res.status(400).send("Course IDs are required");
  }
  const courseIdsArray = courseIds.split(',').map(id => parseInt(id));

  db.query("SELECT id, name, icon_id FROM course WHERE id IN (?)", [courseIdsArray], (err, results) => {
      if (err) {
          return res.status(500).send("Database query error");
      }

      return res.status(200).send(results);
  });
});

const deleteFile = (filePath) => {
  return new Promise((resolve, reject) => {
    fs.unlink(filePath, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};

router.delete("/deleteImgFile/:courseId/:subjectId/:imageName", async (req, res) => {
  const { courseId, subjectId, imageName } = req.params;

  try {
    const imagePath = path.join(__dirname, `../courses/c${courseId}/s${subjectId}`, imageName);
    console.log(imagePath);

    if (!fs.existsSync(imagePath)) {
      return res.status(404).json({ message: "File not found" });
    }

    await deleteFile(imagePath);

    const query = `
      UPDATE subject
      SET images = TRIM(BOTH ',' FROM REPLACE(CONCAT(',', images, ','), ?, ''))
      WHERE courseId = ? AND id = ?
    `;

    db.query(
      query,
      [`,${imageName},`, courseId, subjectId],
      (error, results) => {
        if (error) {
          console.error("Error updating database:", error);
          return res.status(500).json({ message: "Failed to update database" });
        }

        res.status(200).json({ message: "File and database record deleted successfully" });
      }
    );
  } catch (error) {
    console.error("Error deleting file:", error);
    res.status(500).json({ message: "Failed to delete file" });
  }
});

module.exports = router;
