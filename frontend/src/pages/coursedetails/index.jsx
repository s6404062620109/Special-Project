import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import backend from "../../api/backend";

import style from "./css/coursedetails.module.css";
import SubjectCard from "./subjectCard";

function CourseDetail() {
  const { courseId, enrollmentId } = useParams();
  const [data, setData] = useState([]);
  const [courseInfo, setCourseInfo] = useState({
    id: "",
    name: "",
    icon: "",
  });
  const [userData, setUserData] = useState({
    id: null,
    email: null,
    name: null,
    role: null,
    profile_img: null,
  });
  const [imgPath, setImgPath] = useState("");
  const [history, setHistory] = useState([]);
  const [progress, setProgress] = useState([]);
  const [pretestProgress, setPretestProgress] = useState([]);
    const [posttestProgress, setPosttestProgress] = useState([]);
  const emailrefStorage = localStorage.getItem("email");

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await backend.get(
          `/auth/authorization/${emailrefStorage}`,
          {
            withCredentials: true,
          }
        );
        if (response.status === 200) {
          setUserData({
            id: response.data.id,
            email: response.data.email,
            name: response.data.name,
            role: response.data.role,
            profile_img: response.data.profile_img,
          });
        }
      } catch (error) {
        console.log(error);
      }
    };
    fetchUserData();
  }, [emailrefStorage]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await backend.get(`/subjects/getAllSubject/${courseId}`);

        let responseCourse = response.data.courseInfo[0];

        setCourseInfo({
          id: responseCourse.id,
          name: responseCourse.name,
          icon: responseCourse.icon_id,
        });
        setData(response.data.subject);
      } catch (err) {
        console.log(err);
      }
    };

    fetchData();

    const fetchHistory = async () => {
      try {
        const response = await backend.get(`/enroll/checkCoursesEnroll/${userData.id}`);
        if (response.status === 200) {
          const courseIdNum = Number(courseId);
          const enrollmentIdNum = Number(enrollmentId);
    
          const filteredHistory = response.data.results.filter(
            (record) => record.courseId === courseIdNum && record.id === enrollmentIdNum
          );
    
          console.log("Filtered History:", filteredHistory);
          setHistory(filteredHistory);
        }
      } catch (err) {
        console.log("Error fetching history:", err);
      }
    };    

    fetchHistory();
  }, [courseId, userData.id]);

  useEffect(() => {
    const fetchIcon = async () => {
      try {
        const response = await backend.get(`/imgrender/getIcon/${courseId}/${courseInfo.icon}`);

        if (response.status === 200) {
          setImgPath(`${import.meta.env.VITE_API_BASE_URL}${response.data.url}`);
        }
      } catch (err) {
        console.log("Error fetching icon:", err);
      }
    };
    fetchIcon();

    const fethProgress = async () => {
      try {
        const response = await backend.get(`/progress/checkCourseProgress/${history[0].id}`);

        if (response.status === 200) {
          const pretest = response.data.results.filter(
            (item) => item.type === "pre"
          );
          const posttest = response.data.results.filter(
            (item) => item.type === "post"
          );
          setPretestProgress(pretest);
          setPosttestProgress(posttest);
          setProgress(response.data.results);
        }
      } catch (error) {
        console.log(error);
      }
    };
    if (history.length > 0) {
      fethProgress();
    }
  }, [courseId, courseInfo.icon, history]);

  const isPreTestCompleted =
    pretestProgress.length > 0 &&
    pretestProgress.every((item) => item.is_completed === 1);
  const preTestScore = isPreTestCompleted
    ? pretestProgress.reduce((acc, item) => acc + item.score, 0)
    : null;

  const isPostTestCompleted =
    posttestProgress.length > 0 &&
    posttestProgress.every((item) => item.is_completed === 1);
  const postTestScore = isPostTestCompleted
    ? posttestProgress.reduce((acc, item) => acc + item.score, 0)
    : null;

  return (
    <div className={style.container}>
      <div className={style.head}>
        <img alt="Course Icon Image" src={imgPath} />
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
            {data.map((subject, index) => (
              <SubjectCard
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
        </div>

        <div className={style.testItem}>
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
        </div>
      </div>
    </div>
  );
}

export default CourseDetail;
