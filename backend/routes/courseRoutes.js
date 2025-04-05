const express = require("express");
const fs = require("fs");
const path = require("path"); 
const db = require("../database");
const courseController = require("../controller/courseController");

const router = express.Router();

router.get("/getCourses", courseController.getCourses);

router.get("/getEnrollmentCourses/:courseIds", courseController.getEnrollmentCourses);

/* switch teacher route */
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
/* switch teacher route */

module.exports = router;
