const express = require("express");
const db = require("./database");

const router = express.Router();

router.post('/enrollCourse', (req, res) => {
    const { courseId, userId } = req.body;

    db.query('SELECT id FROM subject WHERE courseId = ?', 
      [courseId], (error, result) => {
        if(error){
          console.log(error);
          return res.status(500).json({ message: "Subject database query error." });
        }

        else{
          console.log(result);
        }
    });
  
    // db.query(`INSERT INTO enrollment ( courseId, userId ) VALUES( ?, ? )`, [courseId, userId], (postErr, postResult) => {
    //   if(postErr){
    //     console.log(postErr);
    //     return res.status(500).json({ message: 'Register enrollment Error.' });
    //   }
  
    //   else{
    //     return res.status(200).json({ message: 'Register Enrollment Successful.' });  
    //   }
    // });
});

router.get("/checkCoursesEnroll/:userId", (req, res) => {
  const userId = req.params.userId;
  
  db.query(`SELECT * FROM enrollment WHERE userId = ?`, [userId], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Database enrollment query error" });
    }
  
    else{
      return res.status(200).json({ results });
    }
  });
});

module.exports = router;