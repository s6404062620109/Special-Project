import React, { useContext, useEffect, useState } from "react";
import backend from '../../api/backend';

import style from "./css/navsubject.module.css";
import { AuthContext } from "../../context/AuthProvider";

function NavSubject({ subjectList, courseId, enrollmentId }) {

  const { userData } = useContext(AuthContext);
  const [ progress, setProgress ] = useState({
    pretest: [],
    posttest: [],
    lab: []
  });

  const fetchProgress = async () => {
    try{
      const response = await backend.get(`/progress/checkCourseProgress/${enrollmentId}/${courseId}`, {
        withCredentials: true
      });

      if(response.status === 200){
        const pretest = response.data.pretest_progress;
        const posttest = response.data.posttest_progress;
        const lab = response.data.lab_progress;

        setProgress({ pretest, posttest, lab });
      }
      
    } catch(error) {
      console.log(error);
    }
  }

  useEffect(() => {
    fetchProgress();
  } ,[enrollmentId]);

  const isPreTestCompleted = progress.pretest.length > 0 && progress.pretest.every(item => item.is_completed === 1);
  const preTestScore = isPreTestCompleted ? progress.pretest.reduce((acc, item) => acc + item.score, 0) : null;

  const isPostTestCompleted = progress.posttest.length > 0 && progress.posttest.every(item => item.is_completed === 1);
  const postTestScore = isPostTestCompleted ? progress.posttest.reduce((acc, item) => acc + item.score, 0) : null;

  const areAllLabsCompleted = progress.lab.length > 0 && progress.lab.every(item => item.is_completed === 1);

  return (
    <div className={style["Nav-Subject"]}>
      <div className={style["subjectlist"]}>
        <div className={style["subjectlist-title"]}>
          <p>
            บทเรียนทั้งหมด
          </p>
        </div>

        <div className={style["subjectlist-wrap"]}>
          {subjectList.map((subject, ind) => {
            const subjectProgressList = progress.lab.filter(
              (prog) => prog.subjectId === subject.id
            );

            const isCompleted =
              subjectProgressList.length > 0 &&
              subjectProgressList.every((prog) => prog.is_completed === 1);

            return (
              <p
                key={ind}
                onClick={() => {
                  if (!isCompleted) {
                    window.location.href = `/course/${courseId}/subject/${subject.id}/${enrollmentId}`;
                  }
                }}
                className={isCompleted ? style["disabled-subject"] : ""}
              >
                {subject.name}
              </p>
            );
          })}
        </div>

        <div className={style["testlist-wrap"]}>
          <p
            className={isPreTestCompleted ? style["disabled-subject"] : ""}
            onClick={() => {
              if (!isPreTestCompleted) {
                window.location.href = `/course/${courseId}/pretest/${enrollmentId}`;
              }
            }}
          >
            {isPreTestCompleted ? `แบบทดสอบก่อนเรียน: ${preTestScore} / ${progress.pretest.length}` : "PreTest"}
          </p>

          <p
            className={isPostTestCompleted || !areAllLabsCompleted ? style["disabled-subject"] : ""}
            onClick={() => {
              if (!isPostTestCompleted && areAllLabsCompleted) {
                window.location.href = `/course/${courseId}/posttest/${enrollmentId}`;
              }
            }}
          >
            {isPostTestCompleted ? `PostTest Score: ${postTestScore} / ${progress.posttest.length}` : areAllLabsCompleted 
                ? "PostTest" : "ต้องทำปฎิบัติการทดสอบทั้งหมดก่อน"
            }
          </p>
        </div>

      </div>
    </div>
  );
}

export default NavSubject;
