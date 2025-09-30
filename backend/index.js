const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
require('dotenv').config();

const app = express();
app.use(cookieParser());

// const allowedOrigins = [
//   `http://${process.env.DEPLOY_URL}:${process.env.FRONTEND_PORT}`,
//   `http://${process.env.DEV_URL}:${process.env.FRONTEND_PORT}`,
//   `http://localhost:8081`,
// ];

// app.use(cors({
//   origin: function (origin, callback) {
//     if (!origin || allowedOrigins.includes(origin)) {
//       callback(null, true);
//     } else {
//       callback(new Error("Not allowed by CORS"));
//     }
//   },
//   methods: ["GET", "POST", "PUT", "DELETE"],
//   allowedHeaders: ["Content-Type", "Authorization"],
//   credentials: true,
// }));

app.use(cors({
  origin: (origin, callback) => {
    callback(null, true); 
  },
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

app.use(express.json());
app.use(bodyParser.json());

/* authRoutes */
const authRoutes = require("./routes/authRoutes");
app.use("/auth", authRoutes);

/* Courses */
const courseRoutes = require("./routes/courseRoutes");
app.use("/courses", courseRoutes);

/* Subject */
const subjectsRoutes = require("./routes/subjectsRoutes");
app.use("/subjects", subjectsRoutes);

/* Pre-Test */
const pretestRoutes = require("./routes/pretestRoutes");
app.use("/pretest", pretestRoutes);

/* Post-Test */
const posttestRoutes = require("./routes/posttestRoutes");
app.use("/posttest", posttestRoutes);

/* Enrollment */
const enrollRoutes = require("./routes/enrollRoutes");
app.use("/enroll", enrollRoutes);

/* Progress */
const progressRoutes = require("./routes/progressRoutes");
app.use("/progress", progressRoutes);

/* Lab on web */
const labsRoutes = require("./routes/labsRoutes");
app.use("/labs", labsRoutes);

/* Admin */
const admin = require("./routes/adminRoutes");
app.use("/admin", admin); 

/* Teacher */
const teachRoutes = require("./routes/teachRoutes");
app.use("/teacher", teachRoutes); 

/* Image */
const Img = require("./routes/imagerender");
app.use("/imgrender", Img);

app.listen(process.env.BACKEND_PORT, () => {
  console.log(`Server is running on port ${process.env.BACKEND_PORT}`);
});