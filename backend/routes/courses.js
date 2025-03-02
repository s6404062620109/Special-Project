const express = require("express");
const db = require("./database");

const router = express.Router();

router.get("/getCourses", (req, res) => {
  db.query("SELECT * FROM course", (err, results) => {
    if (err) {
      return res.status(500).send("Database query error");
    } 

    return res.status(200).send(results);
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
