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

        if (user.role !== "t") {
          return res.status(403).json({ message: "Access denied. Teachers only." });
        }

        db.query("SELECT * FROM course WHERE id = ? AND teacherId = ?", [ courseId, user.id ], (err, courses) => {
          if (err) {
            return res.status(500).json({ message: "Database error while fetching courses." });
          }

          if (courses.length === 0) {
            return res.status(404).json({ message: "No courses found." });
          }

          req.user = user;
          console.log(req.user);
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

module.exports = {
  checkAdminRole,
  checkTeacherRole,
  verifiedTeacherCourse,
};
