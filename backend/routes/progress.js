const express = require("express");
const db = require("./database");

const router = express.Router();

router.post('/registerTestProgress', (req, res) => {
    const { questionIdList, courseId, email } = req.body;
  
    db.query('SELECT HistoryID FROM history WHERE CourseID = ? AND Email = ?', [courseId, email], (error, result) => {
      if (error) {
        console.error(error);
        return res.status(500).json({ message: "Database history query error." });
      }
      if(result.length > 0){
        const historyID = result[0].HistoryID;
   
        for(let i=0; i<questionIdList.length; i++){
          db.query('SELECT SubjectID FROM question WHERE QuestionID = ?', [questionIdList[i]], (error, subjectResult) => {
            if (error) {
              console.error(error);
              return res.status(500).json({ message: "Database question query error." });
            }
            else{
              const subjectID = subjectResult[0].SubjectID;
              let round = 0;
              db.query(`INSERT INTO progress ( QuestionID	, SubjectID, HistoryID ) VALUES( ?, ?, ? )`, [questionIdList[i], subjectID, historyID], (postErr, postResult) => {
                if (postErr) {
                  console.error(postErr);
                  return res.status(500).json({ message: "Progress post error." });
                }
                else{
                  round++;
                  if(round === questionIdList.length){
                    return res.status(200).json({ message: "Progress post Sucessful." });
                  }
                }
              });
            }
          });
        }
      }
    });
});

router.get("/checkCourseProgress/:historyId", (req, res) => {
  const historyId = req.params.historyId;

  db.query(`SELECT * FROM progress WHERE HistoryID = ?`, [historyId], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Database progress query error" });
    }
  
    else{
      return res.status(200).json({ results });
    }
  });
});
  
router.get("/getLatestProgress/:historyId", (req, res) => {
   const historyId = req.params.historyId;
  
   db.query(`SELECT * FROM progress WHERE HistoryID = ? AND Status = ?`, [historyId, 'Failed'], (error, result) => {
     if (error) {
       console.error(error);
       return res.status(500).json({ message: "Database progress query error" });
     }
  
     else{
       let inProgress = '';
       const latestQuestion = result[0].QuestionID;
  
       db.query(`SELECT progress.QuestionID, question.Type, question.SubjectID FROM progress 
         INNER JOIN question ON progress.QuestionID = question.QuestionID 
         WHERE progress.QuestionID = ? AND progress.Status = ?`, 
         [latestQuestion, 'Failed'], (error, latestResult) => {
           if (error) {
             console.error(error);
             return res.status(500).json({ message: "Database progress query error" });
           }
           else{
             const lastestType = latestResult[0].Type;
             const latestSubject = latestResult[0].SubjectID;
             if(lastestType === "Pre"){
               inProgress = `pretest/${historyId}`;
             }
             if(lastestType === "Lab"){
  
               inProgress = `subject/${latestSubject}`;
             }
             return res.status(200).json({ inProgress });
           }
       });
     }
   });
});

module.exports = router;