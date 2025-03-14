const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const multer = require("multer");

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
    credentials: true,
    allowedHeaders: [ "Content-Type", "Authorization" ],
  })
);

app.use(express.json());
app.use(bodyParser.json());

/* Authenticator */
const authenticator = require("./routes/authenticator");
app.use("/auth", authenticator);

/* Courses */
const Courses = require("./routes/courses");
app.use("/courses", Courses);

/* Subject */
const Subjects = require("./routes/subjects");
app.use("/subjects", Subjects);

/* Pre-Test */
const Pretest = require("./routes/pretest");
app.use("/pretest", Pretest);

/* Post-Test */
const Posttest = require("./routes/posttest");
app.use("/posttest", Posttest);

/* Enrollment */
const Enrollment = require("./routes/enroll");
app.use("/enroll", Enrollment);

/* Progress */
const Progress = require("./routes/progress");
app.use("/progress", Progress);

/* Lab on web */
const lab = require("./routes/labtest");
app.use("/lab", lab);

/* lab on test */
const labTest = require('./routes/lab');
app.use("/lab-test", labTest);

/* Question */
const Question = require("./routes/questions");
app.use("/question", Question);

/* Admin */
const admin = require("./routes/admin");
app.use("/admin", admin); 

/* Teacher */
const teacher = require("./routes/teacher");
app.use("/teacher", teacher); 

/* Image */
const Img = require("./routes/imagerender");
app.use("/imgrender", Img);

const port = 3001;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});