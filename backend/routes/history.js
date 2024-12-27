const express = require("express");
const db = require("./database");

const router = express.Router();

router.post('/registerHistory', (req, res) => {
    const { courseId, email } = req.body;
  
    db.query(`INSERT INTO history ( CourseID, Email ) VALUES( ?, ? )`, [courseId, email], (postErr, postResult) => {
      if(postErr){
        console.log(postErr);
        return res.status(500).json({ message: 'Register History Error.' });
      }
  
      else{
        return res.status(200).json({ message: 'Register History Successful.' });  
      }
    });
});

router.get("/checkCoursesHistory/:email", (req, res) => {
  const email = req.params.email;
  
  db.query(`SELECT * FROM history WHERE Email = ?`, [email], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Database history query error" });
    }
  
    else{
      return res.status(200).json({ results });
    }
  });
});

module.exports = router;