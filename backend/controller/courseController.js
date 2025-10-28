const db = require("../database");

const getCourses = (req, res) => {
  try {
    Promise.all([
      new Promise((resolve, reject) => {
        const coursesSql = `
          SELECT 
            c.*, 
            COUNT(DISTINCT e.id) AS enrollmentCount,
            GROUP_CONCAT(DISTINCT t.id) AS tagIds,
            GROUP_CONCAT(DISTINCT t.name) AS tagNames
          FROM course c
          LEFT JOIN enrollment e ON c.id = e.courseId
          LEFT JOIN course_tag ct ON c.id = ct.courseId
          LEFT JOIN tags t ON ct.tagId = t.id
          WHERE c.enable = 1
          GROUP BY c.id
        `;
        db.query(coursesSql, (err, results) => {
          if (err) return reject(err);
          resolve(results);
        });
      }),
      new Promise((resolve, reject) => {
        db.query('SELECT id, name FROM tags ORDER BY name ASC', (err, tags) => {
          if (err) return reject(err);
          resolve(tags);
        });
      })
    ]).then(([courseResults, allTags]) => {
      if (courseResults.length === 0) {
        return res.status(404).send({ message: "No courses found" });
      }

      const dataFormat = courseResults.map(course => {
        const tagIds = course.tagIds ? course.tagIds.split(',') : [];
        const tagNames = course.tagNames ? course.tagNames.split(',') : [];
        const tags = tagIds.map((id, index) => ({
          id: parseInt(id, 10),
          name: tagNames[index]
        }));
        delete course.tagIds;
        delete course.tagNames;
        return { ...course, tags };
      });

      return res.status(200).send({ 
        results: dataFormat,
        allTags: allTags 
      });
    }).catch(err => {
      console.error("Database query error:", err);
      return res.status(500).send({ message: "Database query error" });
    });
  } catch (error) {
    console.error("Server error:", error);
    return res.status(500).json({ message: "Server error.", error });
  }
};

const getTopCourses = (req, res) => {
    try {
        const sql = `
            SELECT 
                c.*, 
                COUNT(DISTINCT e.id) AS enrollmentCount,
                GROUP_CONCAT(DISTINCT t.id) AS tagIds,
                GROUP_CONCAT(DISTINCT t.name) AS tagNames
            FROM course c
            LEFT JOIN enrollment e ON c.id = e.courseId
            LEFT JOIN course_tag ct ON c.id = ct.courseId
            LEFT JOIN tags t ON ct.tagId = t.id
            WHERE c.enable = 1
            GROUP BY c.id
            ORDER BY enrollmentCount DESC, c.id ASC
            LIMIT 3
        `;

        db.query(sql, (err, results) => {
            if (err) {
                console.error("Database query error:", err);
                return res.status(500).send({ message: "Database course query error" });
            }

            const dataFormat = results.map(course => {
                const tagIds = course.tagIds ? course.tagIds.split(',') : [];
                const tagNames = course.tagNames ? course.tagNames.split(',') : [];
                const tags = tagIds.map((id, index) => ({ id: parseInt(id, 10), name: tagNames[index] }));

                delete course.tagIds;
                delete course.tagNames;
                return { ...course, tags };
            });

            return res.status(200).send({ results: dataFormat });
        });
    } catch (error) {
        console.error("Server error:", error);
        return res.status(500).json({ message: "Server error.", error });
    }
};

const getEnrollmentCourses = (req, res) => {
    const { courseIds } = req.params;

    if (!courseIds) {
        return res.status(400).send("Course IDs are required");
    }

    const courseIdsArray = courseIds.split(',').map(id => parseInt(id));

    try {
        const sql = `
            SELECT 
                c.*,
                GROUP_CONCAT(DISTINCT t.id) AS tagIds,
                GROUP_CONCAT(DISTINCT t.name) AS tagNames
            FROM course c
            LEFT JOIN course_tag ct ON c.id = ct.courseId
            LEFT JOIN tags t ON ct.tagId = t.id
            WHERE c.id IN (?) AND c.enable = 1
            GROUP BY c.id
        `;

        db.query(sql, [courseIdsArray], (err, results) => {
            if (err) {
                console.error("Database query error:", err);
                return res.status(500).send({ message: "Database query error" });
            }

            const dataFormat = results.map(course => {
                const tagIds = course.tagIds ? course.tagIds.split(',') : [];
                const tagNames = course.tagNames ? course.tagNames.split(',') : [];
                const tags = tagIds.map((id, index) => ({ id: parseInt(id, 10), name: tagNames[index] }));

                delete course.tagIds;
                delete course.tagNames;
                return { ...course, tags };
            });

            return res.status(200).send(dataFormat);
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Server error.", error });
    }
}

module.exports = {
  getCourses,
  getEnrollmentCourses,
  getTopCourses,
}