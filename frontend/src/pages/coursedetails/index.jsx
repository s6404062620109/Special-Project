import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import backend from "../../api/backend";
import { AuthContext } from "../../context/AuthProvider";

import style from "./css/coursedetails.module.css";
import SubjectData from "./subjectData";

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
      console.log("Error fetching history:", err);
    }
  };

  const fethProgress = async () => {
    try {
      const response = await backend.get(`/progress/checkCourseProgress/${history[0].id}/${courseId}`, {
        withCredentials: true,
      });

      if (response.status === 200) {
        console.log(response)
        const pretest = response.data.results.filter(
          (item) => item.type === "Pre"
        );
        const posttest = response.data.results.filter(
          (item) => item.type === "Post"
        );
        setPretestProgress(pretest);
        setPosttestProgress(posttest);
        setProgress(response.data.results);
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
                <p>SUBJECT</p>
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

      <div className={style.testSection}>
        <div className={style.testItem}>
          {userData.id ? (
            <p
              className={isPreTestCompleted ? style.disabledTest : ""}
              onClick={() => {
                if (!userData.id) {
                  alert("Please login first");
                  window.location.href = "/";
                } else if (!isPreTestCompleted) {
                  window.location.href = `/course/${courseId}/pretest/${enrollmentId}`;
                }
              }}
            >
              {isPreTestCompleted
                ? `PreTest Score: ${preTestScore} / ${pretestProgress.length}`
                : "PreTest"}
            </p>
          ) : (
            <></>
          )}
        </div>

        <div className={style.testItem}>
          {userData.id ? (
            <p
              className={isPostTestCompleted ? style.disabledTest : ""}
              onClick={() => {
                if (!userData.id) {
                  alert("Please login first"); 
                  window.location.href = "/";
                } else if (!isPostTestCompleted) {
                  window.location.href = `/course/${courseId}/posttest/${enrollmentId}`;
                }
              }}
            >
              {isPostTestCompleted
                ? `PostTest Score: ${postTestScore} / ${posttestProgress.length}`
                : "PostTest"}
            </p>
          ) : (
            <></>
          )}
        </div>
      </div>
    </div>
  );
}

export default CourseDetail;
