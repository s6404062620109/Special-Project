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

  try {
    const sql = `
      SELECT q.typeId, q.subjectId
      FROM progress p
      JOIN question q ON p.questionId = q.id
      WHERE p.is_completed = ? AND p.enrollmentId = ?
      LIMIT 1
    `;

    db.query(sql, [false, enrollmentId], (error, results) => {
      if (error) {
        console.error(error);
        return res.status(500).json({ message: "Database query error" });
      }

      if (!results.length) {
        return res.status(404).json({ message: "No in-progress question found." });
      }

      const { typeId, subjectId } = results[0];

      if (typeId === 1) {
        return res.status(200).json({ inProgress: `pretest/${enrollmentId}` });
      }

      if (typeId === 2) {
        return res.status(200).json({ inProgress: `posttest/${enrollmentId}` });
      }

      if ([3, 4, 5, 6].includes(typeId)) {
        return res.status(200).json({ inProgress: `subject/${subjectId}/${enrollmentId}` });
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error.", error });
  }
};

const getAllProgressAnswers = (req, res) => {
  const { enrollmentId } = req.params;
  const { questionIds } = req.query;

  if (!questionIds) {
    return res.status(400).json({ message: "Missing questionIds" });
  }

  const ids = questionIds.split(",").map(Number);

  try {
    db.query(
      `SELECT p.id AS progressId, p.questionId, pa.user_answer
       FROM progress p
       LEFT JOIN progress_answer pa ON pa.progressId = p.id
       WHERE p.enrollmentId = ? AND p.questionId IN (?) AND p.is_completed = 1`,
      [enrollmentId, ids],
      (err, results) => {
        if (err) {
          console.log(err);
          return res.status(500).json({ message: "Database query error" });
        }

        return res.status(200).json({ answers: results });
      }
    );
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error", error });
  }
};

module.exports = {
    checkProgress,
    getLatest,
    getAllProgressAnswers
}