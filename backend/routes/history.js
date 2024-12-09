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

module.exports = router;