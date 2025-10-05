import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import backend from "../../api/backend";
import { AuthContext } from "../../context/AuthProvider";

import { Avatar, Button, Divider, Grid, List, ListItem, ListItemIcon, ListItemText, Stack, Typography } from "@mui/material";
import CircleIcon from '@mui/icons-material/Circle';
import CheckIcon from '@mui/icons-material/Check';
import ClearIcon from '@mui/icons-material/Clear';

import style from "./css/coursedetails.module.css";
import SubjectData from "./SubjectData";

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

        {(announcement === 1 || announcement === 2 || announcement === 3) && (
          <Stack direction="column" alignItems="center" gap={1}>
            <Typography variant="h6">แบบทดสอบก่อนเรียน</Typography>
            {announcement === 3 && renderSubjectScores(subjectList, pretestProgress)}
            <Typography variant="h6">
              คะแนน {preTestScore} / {pretestProgress.length}
            </Typography>
          </Stack>
        )}

        {(announcement === 2 || announcement === 3) && (
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
    updateat: null,
    announcement: 0,
  });
  const [ count, setCount ] = useState({
    countEnrollments: 0,
    countPosttestComplete: 0
  })
  const [ teacherInfo, setTeacherInfo ] = useState({
    sex: "",
    name: "",
    surname: "",
    email: "",
    profile_img: null
  });
  const [ history, setHistory ] = useState([]);
  const [ labProgress, setLabProgress ] = useState([]);
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
          announcement: responseCourse.announce_state,
        });
        
        setTeacherInfo({
          sex: teacherInfo.sex,
          name: teacherInfo.name,
          surname: teacherInfo.surname,
          email: teacherInfo.email,
          profile_img: teacherInfo.profile_img
        });

        setCount({
          countEnrollments: response.data.countEnrollments,
          countPosttestComplete: response.data.countPosttestComplete
        });

        setSubjectList(response.data.subject);
      }
      
    } catch (err) {
      console.log(err);
    }
  };

  const fetchHistory = async () => {
    try {
      const response = await backend.get(`/enroll/checkCourseEnroll/${userData.id}/${courseId}`, {
        withCredentials: true,
      });
      if (response.status === 200) {
        setHistory(response.data.results);
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
        setPretestProgress(response.data.pretest_progress);
        setPosttestProgress(response.data.posttest_progress);
        setLabProgress(response.data.lab_progress);
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

  const isLabCompleted = labProgress.length > 0 && labProgress.every((item) => item.is_completed === 1);

  return (
    <div className={style.container}>
      <div className={style.head}>
        <div>
          <img alt="Course Icon Image" src={courseInfo.icon} />
          <p>{courseInfo.name}</p>
        </div>

        <Stack 
          gap={2}
          sx={{
            alignItems: { xs: "center", sm: "flex-start" },
            flexDirection: 'column',
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
            แก้ไขเมื่อ{" "}
            {courseInfo.updateat
              ? new Date(courseInfo.updateat).toLocaleString("th-TH", {
                  dateStyle: "medium",
                  timeStyle: "short",
                  timeZone: "Asia/Bangkok",
                })
              : "-"}
          </Typography>
          
        </Stack>

      </div>

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
          marginBottom: 2,
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
              {(() => {
                const isEnglish = /^[A-Za-z\s]+$/.test(teacherInfo.name + " " + teacherInfo.surname);

                // ถ้าเป็นภาษาอังกฤษ
                if (isEnglish) {
                  if (teacherInfo.sex === "m") return `Mr. ${teacherInfo.name} ${teacherInfo.surname}`;
                  if (teacherInfo.sex === "f") return `Mrs. ${teacherInfo.name} ${teacherInfo.surname}`;
                  if (teacherInfo.sex === "n") return `Sir. ${teacherInfo.name} ${teacherInfo.surname}`;
                }

                // ถ้าเป็นภาษาไทย
                if (teacherInfo.sex === "m") return `นาย${teacherInfo.name} ${teacherInfo.surname}`;
                if (teacherInfo.sex === "f") return `นาง${teacherInfo.name} ${teacherInfo.surname}`;
                if (teacherInfo.sex === "n") return `คุณ${teacherInfo.name} ${teacherInfo.surname}`;

                // ถ้าไม่ทราบเพศ
                return teacherInfo.name && teacherInfo.surname
                  ? `${teacherInfo.name} ${teacherInfo.surname}`
                  : "ไม่ทราบชื่ออาจารย์";
              })()}
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

      </Stack>

      {userData.id && history.length > 0 && (
        <Stack
          sx={{
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: { xs: "center", sm: "space-between" },
            alignItems: { xs: "center", sm: "flex-start" },
            gap: 2,
            width: "80%",
            margin: "auto",
          }}
        >
          <Stack
            direction="row"
            alignItems="center"
            gap={1}
            sx={{
              cursor: !isPreTestCompleted ? "pointer" : "default",
              color: !isPreTestCompleted ? "#1976d2" : "#979797",
              transition: "color 0.3s",
              "&:hover": {
                color: !isPreTestCompleted ? "#115293" : "#979797",
                borderBottom: "1px solid #000",
              },
            }}
            onClick={() => {
              if (!isPreTestCompleted) {
                navigate(`/course/${courseId}/pretest/${enrollmentId}`);
              }
            }}
          >
            <Typography variant="h6">แบบทดสอบก่อนเรียน</Typography>
            {isPreTestCompleted ? <CheckIcon color="success" /> : <ClearIcon color="error" />}
          </Stack>

          {/* Posttest Section */}
          <Stack
            direction="row"
            alignItems="center"
            gap={1}
            sx={{
              cursor: !isPostTestCompleted && isPreTestCompleted && isLabCompleted ? "pointer" : "default",
              color: !isPostTestCompleted && isPreTestCompleted && isLabCompleted ? "#1976d2" : "#979797",
              transition: "color 0.3s",
              "&:hover": {
                color: !isPostTestCompleted && isPreTestCompleted && isLabCompleted ? "#115293" : "#979797",
                borderBottom: !isPostTestCompleted && isPreTestCompleted && isLabCompleted ? "1px solid #000" : "none",
              },
            }}
            onClick={() => {
              if (!isPostTestCompleted && isPreTestCompleted && isLabCompleted) {
                navigate(`/course/${courseId}/posttest/${enrollmentId}`);
              }
            }}
          >
            <Typography variant="h6">แบบทดสอบหลังเรียน</Typography>
            {isPostTestCompleted ? (
              <CheckIcon color="success" /> 
              ):(
                <ClearIcon 
                  color={!isPostTestCompleted && isPreTestCompleted && isLabCompleted ? "error" : "inherit"} 
                />
              )
            }
          </Stack>
        </Stack>
      )}

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

          {subjectList.length > 0 && labProgress && (
            <tbody>
              {subjectList.map((subject, index) => (
                <SubjectData
                  key={index}
                  id={subject.id}
                  name={subject.name}
                  courseId={subject.courseId}
                  labProgress={labProgress}
                  enrollmentId={enrollmentId}
                />
              ))}
            </tbody>
          )}
        </table>
      </div>

      <Stack
        justifyContent="center"
        alignItems="center"
        gap={2}
        sx={{
          width: { sm: "100%", md: "80%"},
          margin: "auto",
          alignItems: { xs: "flex-start", sm: "center" },
        }}
      >
        <Stack
          justifyContent="space-evenly"
          gap={2}
          sx={{
            flexDirection: { xs: "column", sm: "row" },
            alignItems: { xs: "flex-start", sm: "space-evenly" },
          }}
        >
            <Typography variant="h6">
              จำนวนผู้สมัครเรียน { count.countEnrollments } คน
            </Typography>
            <Typography variant="h6">
              จำนวนผู้สำเร็จการศึกษา { count.countPosttestComplete } คน
            </Typography>
        </Stack>
        
        {(userData.id && history.length === 0) && (
          <Button
            variant="contained"
            sx={{
              width: { md: '50%', xs: '100%' }
            }}
            onClick={() => enrollCourse()}
          >
            สมัครเรียน
          </Button>
        )}

        {(userData.id && history.length > 0) && (
          <Button 
            variant="contained"
            onClick={fetchLatestProgress}
            sx={{
              width: { md: '50%', xs: '100%' }
            }} 
          >
            บทเรียนต่อไป
          </Button>
        )}
      </Stack>

      {userData.id && pretestProgress.length > 0 && posttestProgress.length > 0&& (
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

      
    </div>
  );
}

export default CourseDetail;
