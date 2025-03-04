const express = require("express");
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

module.exports = router;
