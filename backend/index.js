const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
require('dotenv').config();

const app = express();
app.use(cookieParser());

const allowedOrigins = [process.env.FRONTEND_URL];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
  methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
};

app.use(cors(corsOptions));


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
const admin = require("./routes/admin");
app.use("/admin", admin); 

/* Teacher */
const teachRoutes = require("./routes/teachRoutes");
app.use("/teacher", teachRoutes); 

/* Image */
const Img = require("./routes/imagerender");
app.use("/imgrender", Img);

const port = 3001;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});