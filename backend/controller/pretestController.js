const db = require("../database");

const getPretest = (req, res) => {
    const { enrollmentId } = req.params;

    try{
        db.query("SELECT questionId FROM progress WHERE enrollmentId = ?",[enrollmentId], (error, result) => {
            if (error) {
              console.log(error);
              return res.status(500).json({ message: "Database progress query error" });
            }
  
            const questionIdList = result.map(question => question.questionId);
  
            if (!questionIdList.length){
              return res.status(404).json({ message: "Not have any question in this course." });
            }
            
            db.query("SELECT * FROM question WHERE type = 'Pre' AND id IN (?)", [questionIdList], (error, questionResult) => {
              if (error) {
                console.log(error);
                return res.status(500).json({ message: "Database question query error" });
              }
  
              const pretestQuestionIdList = questionResult.map(question => question.id);
  
              if (!pretestQuestionIdList.length){
                return res.status(404).json({ message: "Not have any question pretest in this course." });
              }
              db.query("SELECT * FROM answer WHERE questionId IN (?)", [pretestQuestionIdList], (error, answerResult) => {
                if (error) {
                  console.log(error);
                  return res.status(500).json({ message: "Database answer query error" });
                }
                
                const questionsWithChoices = questionResult.map(question => ({
                  qId: question.id,
                  content: question.content,
                  choice: answerResult
                    .filter(answer => answer.questionId === question.id)
                    .map(answer => ({
                      aId: answer.id,
                      content: answer.content,
                    }))
                }));
  
                return res.status(200).json({ questions: questionsWithChoices });
              });
            });
          }
        );
    } catch(error){
        console.log(error);
        return res.status(500).json({ message: "Server error.", error });
    }
}

module.exports = {
    getPretest,
}