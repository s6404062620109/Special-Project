const jwt = require("jsonwebtoken");
const db = require("../database");

const checkAdminRole = (req, res, next) => {
  const authToken = req.cookies.authToken;
  if (!authToken) {
    return res.status(403).json({ message: "Authorization error! No token provided." });
  }

  try {
    const decoded = jwt.decode(authToken);
    if (!decoded || !decoded.id) {
      return res.status(403).json({ message: "Invalid token." });
    }

    db.query("SELECT id, role, verified_key FROM user WHERE id = ?", [decoded.id], (err, users) => {
      if (err) {
        return res.status(500).json({ message: "Database error while fetching user data." });
      }
      if (users.length === 0) {
        return res.status(404).json({ message: "User not found." });
      }

      const user = users[0];

      try {
        const verified = jwt.verify(authToken, user.verified_key);
        if (verified.id !== user.id) {
          return res.status(403).json({ message: "Invalid or expired token." });
        }

        if (user.role !== "a") {
          return res.status(403).json({ message: "Access denied. Admin only." });
        }

        req.user = user;
        next();
      } catch (error) {
        return res.status(403).json({ message: "Invalid or expired token." });
      }
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error.", error });
  }
};

const checkTeacherRole = (req, res, next) => {
  const authToken = req.cookies.authToken;
  if (!authToken) {
    return res.status(403).json({ message: "Authorization error! No token provided." });
  }

  try {
    const decoded = jwt.decode(authToken);
    if (!decoded || !decoded.id) {
      return res.status(403).json({ message: "Invalid token." });
    }

    db.query("SELECT id, role, verified_key FROM user WHERE id = ?", [decoded.id], (err, users) => {
      if (err) {
        return res.status(500).json({ message: "Database error while fetching user data." });
      }
      if (users.length === 0) {
        return res.status(404).json({ message: "User not found." });
      }

      const user = users[0];

      try {
        const verified = jwt.verify(authToken, user.verified_key);
        if (verified.id !== user.id) {
          return res.status(403).json({ message: "Invalid or expired token." });
        }

        if (user.role !== "t") {
          return res.status(403).json({ message: "Access denied. Teachers only." });
        }

        req.user = user;
        next();
      } catch (error) {
        return res.status(403).json({ message: "Invalid or expired token." });
      }
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error.", error });
  }
};

const checkStudentRole = (req, res, next) => {
  const authToken = req.cookies.authToken;
  if (!authToken) {
    return res.status(403).json({ message: "Authorization error! No token provided." });
  }

  try {
    const decoded = jwt.decode(authToken);
    if (!decoded || !decoded.id) {
      return res.status(403).json({ message: "Invalid token." });
    }

    db.query("SELECT id, role, verified_key FROM user WHERE id = ?", [decoded.id], (err, users) => {
      if (err) {
        return res.status(500).json({ message: "Database error while fetching user data." });
      }
      if (users.length === 0) {
        return res.status(404).json({ message: "User not found." });
      }

      const user = users[0];

      try {
        const verified = jwt.verify(authToken, user.verified_key);
        if (verified.id !== user.id) {
          return res.status(403).json({ message: "Invalid or expired token." });
        }

        if (user.role !== "s") {
          return res.status(403).json({ message: "Access denied. Student only." });
        }

        req.user = user;
        next();
      } catch (error) {
        return res.status(403).json({ message: "Invalid or expired token." });
      }
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error.", error });
  }
};

const checkCourseCreation = (req, res, next) => {
  const authToken = req.cookies.authToken;
  if (!authToken) {
    return res.status(403).json({ message: "Authorization error! No token provided." });
  }

  try {
    const decoded = jwt.decode(authToken);
    if (!decoded || !decoded.id) {
      return res.status(403).json({ message: "Invalid token." });
    }

    db.query("SELECT id, role, verified_key FROM user WHERE id = ?", [decoded.id], (err, users) => {
      if (err) {
        return res.status(500).json({ message: "Database error while fetching user data." });
      }
      if (users.length === 0) {
        return res.status(404).json({ message: "User not found." });
      }

      const user = users[0];

      try {
        const verified = jwt.verify(authToken, user.verified_key);
        if (verified.id !== user.id) {
          return res.status(403).json({ message: "Invalid or expired token." });
        }

        if (user.role !== "t" && user.role !== "a") {
          return res.status(403).json({ message: "Access denied. Teachers or Admins only." });
        }

        req.user = user;
        next();
      } catch (error) {
        return res.status(403).json({ message: "Invalid or expired token." });
      }
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error.", error });
  }
};

const verifiedStudentEnrollCourse = (req, res, next) => {
  const { courseId } = req.params;
  const authToken = req.cookies.authToken;

  if (!authToken) {
    return res.status(403).json({ message: "Authorization error! No token provided." });
  }

  try {
    const decoded = jwt.decode(authToken);
    if (!decoded || !decoded.id) {
      return res.status(403).json({ message: "Invalid token." });
    }

    db.query("SELECT id, role, verified_key FROM user WHERE id = ?", [decoded.id], (err, users) => {
      if (err) {
        return res.status(500).json({ message: "Database error while fetching user data." });
      }
      if (users.length === 0) {
        return res.status(404).json({ message: "User not found." });
      }

      const user = users[0];

      try {
        const verified = jwt.verify(authToken, user.verified_key);
        if (verified.id !== user.id) {
          return res.status(403).json({ message: "Invalid or expired token." });
        }

        if (user.role !== "s") {
          return res.status(403).json({ message: "Access denied. Student only." });
        }

        db.query("SELECT * FROM enrollment WHERE courseId = ? AND userId = ?", [ courseId, user.id ], (err, courses) => {
          if (err) {
            return res.status(500).json({ message: "Database error while fetching courses." });
          }

          if (courses.length === 0) {
            return res.status(404).json({ message: "No courses found." });
          }

          req.user = user;
          next();
        });
      } catch (error) {
        return res.status(403).json({ message: "Invalid or expired token." });
      }
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error.", error });
  }
};

const verifiedTeacherCourse = (req, res, next) => {
  const { courseId } = req.params;
  const authToken = req.cookies.authToken;

  if (!authToken) {
    return res.status(403).json({ message: "Authorization error! No token provided." });
  }

  try {
    const decoded = jwt.decode(authToken);
    if (!decoded || !decoded.id) {
      return res.status(403).json({ message: "Invalid token." });
    }

    db.query("SELECT id, role, verified_key FROM user WHERE id = ?", [decoded.id], (err, users) => {
      if (err) {
        return res.status(500).json({ message: "Database error while fetching user data." });
      }
      if (users.length === 0) {
        return res.status(404).json({ message: "User not found." });
      }

      const user = users[0];

      try {
        const verified = jwt.verify(authToken, user.verified_key);
        if (verified.id !== user.id) {
          return res.status(403).json({ message: "Invalid or expired token." });
        }

        if (user.role !== "t" && user.role !== "a") {
          return res.status(403).json({ message: "Access denied. Teachers or Admins only." });
        }

        db.query("SELECT * FROM course WHERE id = ? AND teacherId = ?", [ courseId, user.id ], (err, courses) => {
          if (err) {
            return res.status(500).json({ message: "Database error while fetching courses." });
          }

          if (courses.length === 0) {
            return res.status(404).json({ message: "No courses found." });
          }

          req.user = user;
          next();
        });
      } catch (error) {
        return res.status(403).json({ message: "Invalid or expired token." });
      }
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error.", error });
  }
};

const verifiedEnrollCourseExpired = (req, res, next) => {
  const { enrollmentId } = req.params;

  if (!enrollmentId) {
    return res.status(403).json({ message: "EnrollmentId required." });
  }

  try{
    db.query("SELECT endat, expires_at FROM enrollment WHERE id = ? AND posttest_complete IN (0, 1, -1)", [enrollmentId], (error, result) => {
      if(error){
        console.log(error);
        return res.status(500).json({ message: "Database enrollment query error." });
      }

      if(result.length === 0){
        return res.status(404).json({ message: "Not found enrollment." });
      }

      const enroll = result[0];
      if( enroll.endat === null && enroll.expires_at && new Date(enroll.expires_at) < new Date()){
        return res.status(403).json({ message: "คอร์สนี้หมดอายุการเรียนแล้ว"});
      } 
      else{
        next();
      }
    });
  }catch(error){
    console.log(error);
    return res.status(500).json({ message: "Server error.", error });
  }
}

module.exports = {
  checkAdminRole,
  checkTeacherRole,
  checkStudentRole,
  checkCourseCreation,
  verifiedStudentEnrollCourse,
  verifiedTeacherCourse,
  verifiedEnrollCourseExpired,
};
