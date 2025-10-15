const db = require("../database");

const getCourses = (req, res) => {
    try{
        db.query("SELECT * FROM course WHERE enable = 1", (err, results) => {
            if (err) {
              return res.status(500).send({ message: "Database course query error" });
            } 
            
            if (results.length === 0) {
              return res.status(400).send({ message: "No courses found" });
            }

            const courseIds = results.map(course => course.id);

            db.query("SELECT id, courseId FROM enrollment WHERE courseId IN (?)", [courseIds], (err, enrollmentResults) => {
              if (err) {
                return res.status(500).send({ message: "Database enrollment query error" });
              }

              const dataFormat = results.map(course => {
                const enrollmentCount = enrollmentResults.filter(enrollment => enrollment.courseId === course.id).length;
                return {
                  ...course,
                  enrollmentCount
                };
              });


              return res.status(200).send({ results: dataFormat});
            });
          }
        );

    } catch(error){
        console.log(error);
        return res.status(500).json({ message: "Server error.", error });
    }
}

const getEnrollmentCourses = (req, res) => {
    const { courseIds } = req.params;

    if (!courseIds) {
        return res.status(400).send("Course IDs are required");
    }

    const courseIdsArray = courseIds.split(',').map(id => parseInt(id));

    try{
        db.query("SELECT id, name, icon FROM course WHERE id IN (?) AND enable = 1", [courseIdsArray], (err, results) => {
            if (err) {
                return res.status(500).send("Database query error");
            }
      
            return res.status(200).send(results);
        });

    } catch(error){
        console.log(error);
        return res.status(500).json({ message: "Server error.", error });
    }
}

module.exports = {
  getCourses,
  getEnrollmentCourses,
}