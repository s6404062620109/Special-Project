const db = require("../database");

const checkProgress = (req, res) => {
    const { enrollmentId } = req.params;

    try{
        db.query(`SELECT * FROM progress WHERE enrollmentId = ?`, [enrollmentId], (err, results) => {
            if (err) {
              console.error(err);
              return res.status(500).json({ message: "Database progress query error" });
            }
            
            const filteredResults = results.map(item => item.questionId);
            db.query(`SELECT id, typeId, subjectId FROM question WHERE id IN (?)`, [filteredResults], (error, questionResults) => {
              if (error) {
                console.error(error);
                return res.status(500).json({ message: "Database question query error" });
              }
        
              const combinedResults = results.map(progress => {
                const matchedQuestion = questionResults.find(q => q.id === progress.questionId);
                return {
                  ...progress,
                  subjectId: matchedQuestion ? matchedQuestion.subjectId : null,
                  typeId: matchedQuestion ? matchedQuestion.typeId : null
                };
              });
        
              return res.status(200).json({ results: combinedResults });
            });
        
        });
    } catch(error){
        console.log(error);
        return res.status(500).json({ message: "Server error.", error });
    }
}

const getLatest = (req, res) => {
    const { enrollmentId } = req.params;

    try{
        db.query("SELECT questionId FROM progress WHERE is_completed = ? AND enrollmentId = ?", [false, enrollmentId], (error, result) => {
            if(error){
              console.log(error);
              return res.status(500).json({ message: "Database progress query error" });
            }
        
            const inProgressId = result[0].questionId;
            db.query("SELECT typeId, subjectId FROM question WHERE id = ?", [inProgressId], (error, questionResult) => {
              if(error){
                console.log(error);
                return res.status(500).json({ message: "Database question query error" });
              }
        
              if(questionResult[0].typeId === 1){
                return res.status(200).json({ inProgress: `pretest/${enrollmentId}` });
              }
        
              if(questionResult[0].typeId === 2){
                return res.status(200).json({ inProgress: `posttest/${enrollmentId}` });
              }

              if (questionResult[0].typeId === 3 || questionResult[0].typeId === 4 || questionResult[0].typeId === 5 || questionResult[0].typeId === 6) {
                return res.status(200).json({ inProgress: `subject/${questionResult[0].subjectId}/${enrollmentId}` });
              }
            });
        });
    } catch(error){
        console.log(error);
        return res.status(500).json({ message: "Server error.", error });
    }
}

module.exports = {
    checkProgress,
    getLatest
}