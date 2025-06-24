import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import backend from "../../api/backend";
import { AuthContext } from "../../context/AuthProvider";

import { Button, List, ListItem, ListItemIcon, ListItemText, Stack, Typography } from "@mui/material";
import CircleIcon from '@mui/icons-material/Circle';

import style from "./css/coursedetails.module.css";
import SubjectData from "./subjectData";
import { consumeSlots } from "@mui/x-charts/internals";

function CourseDetail() {
  const { courseId, enrollmentId } = useParams();
  const { userData } = useContext(AuthContext);
  const [ subjectList, setSubjectList ] = useState([]);
  const [ courseInfo, setCourseInfo ] = useState({
    id: "",
    name: "",
    icon: "",
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
        let responseCourse = response.data.courseInfo[0];
        setCourseInfo({
          id: responseCourse.id,
          name: responseCourse.name,
          icon: responseCourse.icon,
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
        <img alt="Course Icon Image" src={courseInfo.icon} />
        <p>{courseInfo.name}</p>
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
          <Typography variant="h6">ผลการทำแบบทดสอบ</Typography>
          <Stack
            sx={{
              flexDirection: { xs: "column", sm: "row" },
              justifyContent: { xs: "center", sm: "space-between" },
              gap: 2,
              width: "80%",
            }}
          >
            {userData.id && isPreTestCompleted ? (
              <Stack
                direction="column"
                justifyContent="center"
                alignItems="center"
              >
                <Typography variant="h6">PreTest</Typography>

                <List>
                  {subjectList.map((subject) => (
                    <ListItem>
                      <ListItemIcon>
                        <CircleIcon 
                          fontSize="small"
                          sx={{
                            color:
                              pretestProgress.find((p) => p.subjectId === subject.id)?.score === 1
                                ? "green"
                                : "red"
                          }}
                        />
                      </ListItemIcon>
                      <ListItemText
                        primary={subject.name}
                        secondary={
                          pretestProgress.find((p) => p.subjectId === subject.id)?.score === 1
                            ? "Success"
                            : "Failed"
                        }
                      />
                    </ListItem>
                  ))}
                </List>

                <Typography
                  variant="h6"
                >
                  คะแนน {preTestScore} / {pretestProgress.length}
                </Typography>
                
              </Stack>
            ) : (
                <></>
            )}

            {userData.id && isPostTestCompleted ? (
              <Stack
                direction="column"
                justifyContent="center"
                alignItems="center"
              >
                <Typography variant="h6">PostTest</Typography>

                <List>
                  {subjectList.map((subject) => (
                    <ListItem>
                      <ListItemIcon>
                        <CircleIcon 
                          fontSize="small"
                          sx={{
                            color:
                              posttestProgress.find((p) => p.subjectId === subject.id)?.score === 1
                                ? "green"
                                : "red"
                          }}
                        />
                      </ListItemIcon>

                      <ListItemText
                        primary={subject.name}
                        secondary={
                          posttestProgress.find((p) => p.subjectId === subject.id)?.score === 1
                            ? "Success"
                            : "Failed"
                        }
                      />
                    </ListItem>
                  ))}
                </List>

                <Typography
                  variant="h6"
                >
                  คะแนน {postTestScore} / {posttestProgress.length}
                </Typography>
                
              </Stack>
            ) : (
                <></>
            )}
          </Stack>

          {userData.id && history.length > 0 && !AllQuestionComplete && (
            <Button 
              variant="contained"
              onClick={fetchLatestProgress} 
            >
              บทเรียนต่อไป
            </Button>
          )}
        </div>
      )}
      
    </div>
  );
}

export default CourseDetail;
