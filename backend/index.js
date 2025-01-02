const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const multer = require("multer");

const app = express();

app.use(
  cors({
    origin: [ "http://localhost:5173" ],
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

/* History */
const History = require("./routes/history");
app.use("/history", History);

/* Progress */
const Progress = require("./routes/progress");
app.use("/progress", Progress);

/* Lab */
const Labtest = require("./routes/labtest");
app.use("/lab", Labtest);

const Question = require("./routes/questions");
app.use("/question", Question);

const Img = require("./routes/imagerender");
app.use("/imgrender", Img);

const port = 3001;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});