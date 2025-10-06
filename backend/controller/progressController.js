const db = require("../database");

const checkProgress = (req, res) => {
    const { enrollmentId } = req.params;

    try{
      db.query("SELECT * FROM question_progress WHERE enrollmentId = ?", [enrollmentId], (err, results) => {
        if (err) {
          return res.status(500).send({ message: "Database question_progress query error" });
        }

        const pretest_progress = results.filter(progress => progress.type === 'pre');
        const posttest_progress = results.filter(progress => progress.type === 'post');

        db.query("SELECT * FROM lab_progress WHERE enrollmentId = ?", [enrollmentId], (labProgressErr, labProgressResults) => {
          if (labProgressErr) {
            return res.status(500).send({ message: "Database lab_progress query error" });
          }
          
          db.query("SELECT id, subjectId, typeId FROM labs WHERE id IN (?)", [labProgressResults.map(lab => lab.questionId)], (labErr, labResults) => {
            if (labErr) {
              return res.status(500).send({ message: "Database subject query error" });
            }

            const labProgress = labProgressResults.map(labp => {
              const matchedSubject = labResults.find(lab => lab.id === labp.questionId);
              return {
                ...labp,
                typeId: matchedSubject ? matchedSubject.typeId : null,
                subjectId: matchedSubject ? matchedSubject.subjectId : null
              }
            });

            return res.status(200).send({
              pretest_progress: pretest_progress,
              posttest_progress: posttest_progress,
              lab_progress: labProgress
            });
          });
          
        })
      });
    } catch(error){
        console.log(error);
        return res.status(500).json({ message: "Server error.", error });
    }
}

const checkProgressAnswers = (req, res) => {
  const { enrollmentId, mode } = req.params;

  if (!enrollmentId || !mode) {
    return res.status(400).send({ message: "Missing enrollmentId or mode" });
  }

  try {
    if (mode === "lab") {
      db.query("SELECT id, score FROM lab_progress WHERE enrollmentId = ?", [enrollmentId], (err, results) => {
        if (err) return res.status(500).send({ message: "Database lab_progress query error" });
        if (results.length === 0) return res.status(404).send({ message: "Progress not found" });

        const progressScoreMap = {};
        results.forEach(p => { progressScoreMap[p.id] = p.score; });
        const progressIds = results.map(p => p.id);

        db.query("SELECT * FROM lab_logs WHERE progressId IN (?)", [progressIds], (logErr, logResults) => {
          if (logErr) return res.status(500).send({ message: "Database lab_logs query error" });

          const mergedResults = logResults.map(log => ({
            ...log,
            score: progressScoreMap[log.progressId] || 0
          }));

          return res.status(200).send({ answers: mergedResults });
        });
      });
    }

    else if (mode === "pre" || mode === "post") {
      const type = mode === "pre" ? "pre" : "post";
      db.query("SELECT id, score FROM question_progress WHERE enrollmentId = ? AND type = ?", [enrollmentId, type], (err, results) => {
        if (err) return res.status(500).send({ message: "Database question_progress query error" });
        if (results.length === 0) return res.status(404).send({ message: "Progress not found" });

        const progressScoreMap = {};
        results.forEach(p => { progressScoreMap[p.id] = p.score; });
        const progressIds = results.map(p => p.id);

        db.query("SELECT * FROM question_logs WHERE progressId IN (?)", [progressIds], (logErr, logResults) => {
          if (logErr) return res.status(500).send({ message: "Database question_logs query error" });

          const mergedResults = logResults.map(log => ({
            ...log,
            score: progressScoreMap[log.progressId] || 0
          }));

          return res.status(200).send({ answers: mergedResults });
        });
      });
    }

    else {
      return res.status(400).send({ message: "Invalid mode" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error.", error });
  }
};


const getLatest = (req, res) => {
  const { enrollmentId } = req.params;

  try {
    db.query(`SELECT courseId, pretest_complete, posttest_complete, completed_labs, total_labs FROM enrollment WHERE id = ?`, [enrollmentId], (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Database enrollment query error" });
      }

      if (results.length === 0){
        return res.status(404).json({ message: "Enrollment not found" });
      }

      const pretestComplete = results[0].pretest_complete;
      const posttestComplete = results[0].posttest_complete;
      const completeLabs = (results[0].completed_labs === results[0].total_labs) ? 1 : 0;

      db.query(`SELECT id FROM subject WHERE courseId = ?`, [results[0].courseId], (error, subjectResults) => {
        if (error) {
          console.log(error);
          return res.status(500).json({ message: "Database subject query error" });
        }

        const subjectIds = subjectResults.map(subject => subject.id);

        db.query(`SELECT id, subjectId FROM labs WHERE subjectId IN (?) AND typeId IN (3, 5, 6)`, [subjectIds], (labErr, labResults) => {
          if (labErr) {
            console.log(labErr);
            return res.status(500).json({ message: "Database lab query error" });
          }
          db.query(`SELECT is_completed, questionId FROM lab_progress WHERE enrollmentId = ?`, [enrollmentId], (labProgressErr, labProgressResults) => {
            if (labProgressErr) {
              console.log(labProgressErr);
              return res.status(500).json({ message: "Database lab progress query error" });
            }

            if (pretestComplete !== 1){
              return res.status(200).json({ inProgress: `pretest/${enrollmentId}` })
            }

            if(completeLabs === 0){
              const incompleteLabSubjects = labProgressResults
                .filter(lp => lp.is_completed !== 1)
                .map(lp => {
                  const matchedLab = labResults.find(lab => lab.id === lp.questionId);
                  return matchedLab ? matchedLab.subjectId : null;
                })
                .filter(Boolean);
              
              if (incompleteLabSubjects.length > 0) {
                return res.status(200).json({ inProgress: `subject/${incompleteLabSubjects[0]}/${enrollmentId}` });
              } else{
                return res.status(404).json({ message: "Not found lab in progress" })
              }

            }

            if(posttestComplete !== 1 && completeLabs === 1 && pretestComplete === 1){
              return res.status(200).json({ inProgress: `posttest/${enrollmentId}` })
            }
          });

        });
      });

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
    db.query(`SELECT p.id AS progressId, p.questionId, log.user_answer
       FROM lab_progress p
       LEFT JOIN lab_logs log ON log.progressId = p.id
       WHERE p.enrollmentId = ? AND p.questionId IN (?) AND p.is_completed = 1`,
      [enrollmentId, ids], (err, results) => {
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
    checkProgressAnswers,
    getLatest,
    getAllProgressAnswers
}