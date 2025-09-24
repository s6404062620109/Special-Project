import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import backend from "../../api/backend";
import { AuthContext } from "../../context/AuthProvider";

import { Avatar, Button, Divider, Grid, List, ListItem, ListItemIcon, ListItemText, Stack, Typography } from "@mui/material";
import CircleIcon from '@mui/icons-material/Circle';

import style from "./css/coursedetails.module.css";
import SubjectData from "./subjectData";

const renderSubjectScores = (subjects, progressList) => (
  <List>
    {subjects.map((subject) => {
      const result = progressList.find((p) => p.subjectId === subject.id);
      return (
        <ListItem key={subject.id}>
          <ListItemIcon>
            <CircleIcon
              fontSize="small"
              sx={{ color: result?.score === 1 ? "green" : "red" }}
            />
          </ListItemIcon>
          <ListItemText
            primary={subject.name}
            secondary={result?.score === 1 ? "Success" : "Failed"}
          />
        </ListItem>
      );
    })}
  </List>
);

const renderTestSection = (announcement, {
  pretestProgress,
  posttestProgress,
  preTestScore,
  postTestScore,
  subjectList
}) => {
  const isPreTestCompleted =
    pretestProgress.length > 0 &&
    pretestProgress.every((item) => item.is_completed === 1);

  const isPostTestCompleted =
    posttestProgress.length > 0 &&
    posttestProgress.every((item) => item.is_completed === 1);

  if (announcement === 0) {
    return <Typography variant="h6">คะแนนกำลังอยู่ในขั้นตอนการประเมินผล</Typography>;
  }

  return (
    <>
      <Typography variant="h6">ผลการทำแบบทดสอบ</Typography>
      <Stack
        sx={{
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: { xs: "center", sm: "space-between" },
          gap: 2,
          width: "80%",
        }}
      >

        {isPreTestCompleted && (announcement === 1 || announcement === 2 || announcement === 3) && (
          <Stack direction="column" alignItems="center" gap={1}>
            <Typography variant="h6">แบบทดสอบก่อนเรียน</Typography>
            {announcement === 3 && renderSubjectScores(subjectList, pretestProgress)}
            <Typography variant="h6">
              คะแนน {preTestScore} / {pretestProgress.length}
            </Typography>
          </Stack>
        )}

        {isPostTestCompleted && (announcement === 2 || announcement === 3) && (
          <Stack direction="column" alignItems="center" gap={1}>
            <Typography variant="h6">แบบทดสอบหลังเรียน</Typography>
            {announcement === 3 && renderSubjectScores(subjectList, posttestProgress)}
            <Typography variant="h6">
              คะแนน {postTestScore} / {posttestProgress.length}
            </Typography>
          </Stack>
        )}
      </Stack>
    </>
  );
};

function CourseDetail() {
  const { courseId, enrollmentId } = useParams();
  const { userData } = useContext(AuthContext);
  const [ subjectList, setSubjectList ] = useState([]);
  const [ courseInfo, setCourseInfo ] = useState({
    id: "",
    name: "",
    icon: "",
    createat: null,
    updateat: null
  });
  const [ teacherInfo, setTeacherInfo ] = useState({
    name: "",
    email: "",
    profile_img: null
  });
  const [ history, setHistory ] = useState([]);
  const [ progress, setProgress ] = useState([]);
  const [ pretestProgress, setPretestProgress ] = useState([]);
  const [ posttestProgress, setPosttestProgress ] = useState([]);
  const navigate = useNavigate();

  const fetchCourseInfo = async () => {
    try {
      const response = await backend.get(`/subjects/getAllSubject/${courseId}`);

      if(response.status === 200){
        let responseCourse = response.data.courseInfo;
        let teacherInfo = response.data.teacherInfo;

        setCourseInfo({
          id: responseCourse.id,
          name: responseCourse.name,
          icon: responseCourse.icon,
          createat: responseCourse.createat,
          updateat: responseCourse.updateat,
          announcement: responseCourse.announce_state
        });
        
        setTeacherInfo({
          name: teacherInfo.name,
          email: teacherInfo.email,
          profile_img: teacherInfo.profile_img
        });

        setSubjectList(response.data.subject);
      }
      
    } catch (err) {
      console.log(err);
    }
  };

  const fetchHistory = async () => {
    try {
      const response = await backend.get(`/enroll/checkCoursesEnroll/${userData.id}`, {
        withCredentials: true,
      });
      if (response.status === 200) {
        const courseIdNum = Number(courseId);
        const enrollmentIdNum = Number(enrollmentId);

        const filteredHistory = response.data.results.filter(
          (record) => record.courseId === courseIdNum && record.id === enrollmentIdNum
        );
        setHistory(filteredHistory);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const fethProgress = async () => {
    try {
      const response = await backend.get(`/progress/checkCourseProgress/${history[0].id}/${courseId}`, {
        withCredentials: true,
      });

      if (response.status === 200) {

        const pretest = response.data.results.filter(
          (item) => item.typeId === 1
        );
        const posttest = response.data.results.filter(
          (item) => item.typeId === 2
        );
        setPretestProgress(pretest);
        setPosttestProgress(posttest);
        setProgress(response.data.results);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const fetchLatestProgress = async () => {
    try {
      const response = await backend.get(`/progress/getLatestProgress/${enrollmentId}/${courseId}`, {
        withCredentials: true
      });

      if (response.status === 200) {
        navigate(`/course/${courseId}/${response.data.inProgress}`);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const enrollCourse = async () => {
    try {
      const response = await backend.post(`/enroll/enrollCourse`, {
        courseId: courseId,
        userId: userData.id,
      }, {withCredentials: true});
  
      if (response.status === 200) {
        navigate(`/course/${courseId}/pretest/${response.data.enrollmentId}`);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchCourseInfo();
    fetchHistory();
  }, [courseId, userData.id]);

  useEffect(() => {
    if (history.length > 0) {
      fethProgress();
    }
  }, [history]);

  const isPreTestCompleted = pretestProgress.length > 0 && pretestProgress.every((item) => item.is_completed === 1);
  const preTestScore = isPreTestCompleted ? pretestProgress.reduce((acc, item) => acc + item.score, 0) : null;

  const isPostTestCompleted = posttestProgress.length > 0 && posttestProgress.every((item) => item.is_completed === 1);
  const postTestScore = isPostTestCompleted ? posttestProgress.reduce((acc, item) => acc + item.score, 0) : null;

  const AllQuestionComplete = progress.length > 0 && progress.every(p => p.is_completed === 1);

  return (
    <div className={style.container}>
      <div className={style.head}>
        <div>
          <img alt="Course Icon Image" src={courseInfo.icon} />
          <p>{courseInfo.name}</p>
        </div>
        
        {(userData.id && history.length === 0) && (
          <Button
            variant="contained"
            sx={{
              width: { md: '25%', xs: '100%' }
            }}
            onClick={() => enrollCourse()}
          >
            สมัครเรียน
          </Button>
        )}

        {userData.id && history.length > 0 && !AllQuestionComplete && (
          <Button 
            variant="contained"
            onClick={fetchLatestProgress}
            sx={{
              width: { md: '25%', xs: '100%' }
            }} 
          >
            บทเรียนต่อไป
          </Button>
        )}

      </div>

      <div className={style.content}>
        <table>
          <thead>
            <tr>
              <th>
                <p>บทเรียน</p>
              </th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {subjectList.map((subject, index) => (
              <SubjectData
                key={index}
                id={subject.id}
                name={subject.name}
                courseId={subject.courseId}
                progress={progress}
                enrollmentId={enrollmentId}
              />
            ))}
          </tbody>
        </table>
      </div>

      {userData.id && progress.length > 0 && (
        <div className={style.testSection}>
           {renderTestSection(courseInfo.announcement, {
              pretestProgress,
              posttestProgress,
              preTestScore,
              postTestScore,
              subjectList,
            })}
        </div>
      )}

      <Divider sx={{ my: 3 }} />

      <Typography variant="h6">อาจารย์ผู้สอน</Typography>
      <Stack
        direction="row"
        spacing={2}
        alignItems="center"
        sx={{
          p: 2,
          borderRadius: 2,
          boxShadow: 1,
          flexWrap: "wrap",
          justifyContent: "space-evenly",
          gap: 2,
        }}
      >

        <Stack 
          direction="row"
          alignItems="center"
          gap={2}
        >
          <Avatar
            src={teacherInfo.profile_img || undefined}
            alt={teacherInfo.name}
            sx={{ width: 72, height: 72 }}
          />
          <Stack spacing={0.5}>
            <Typography variant="subtitle1" fontWeight="600">
              {teacherInfo.name || "ไม่ทราบชื่ออาจารย์"}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ wordBreak: "break-word" }}
            >
              {teacherInfo.email || "-"}
            </Typography>
          </Stack>
        </Stack>

        <Stack 
          gap={2}
          sx={{
            alignItems: { xs: "center", sm: "flex-start" },
            flexDirection: { xs: "column", sm: "row", md: "column" },
            justifyContent: { xs: "center", sm: "space-between" },
          }}
        >
          <Typography variant="caption" color="text.secondary">
            สร้างเมื่อ{" "}
            {courseInfo.createat
              ? new Date(courseInfo.createat).toLocaleString("th-TH", {
                  dateStyle: "medium",
                  timeStyle: "short",
                  timeZone: "Asia/Bangkok",
                })
              : "-"}
          </Typography>

          <Typography variant="caption" color="text.secondary">
            แก้ไขล่าสุด{" "}
            {courseInfo.updateat
              ? new Date(courseInfo.updateat).toLocaleString("th-TH", {
                  dateStyle: "medium",
                  timeStyle: "short",
                  timeZone: "Asia/Bangkok",
                })
              : "-"}
          </Typography>
        </Stack>
      </Stack>
      
    </div>
  );
}

export default CourseDetail;
