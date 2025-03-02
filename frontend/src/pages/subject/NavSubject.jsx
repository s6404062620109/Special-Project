import React, { useEffect, useState } from "react";
import backend from '../../api/backend';

import style from "./css/navsubject.module.css";

function NavSubject({ subjectList, courseId, enrollmentId }) {

  const [userData, setUserData] = useState({
      id:null,
      email:null,
      name:null,
      role:null,
      profile_img:null,
  });
  const emailrefStorage = localStorage.getItem("email");
  const [ progress, setProgress ] = useState({
    pretest: [],
    posttest: [],
    lab: []
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try{
        const response = await backend.get(`/auth/authorization/${emailrefStorage}`, {
          withCredentials: true
        });
        if(response.status === 200){
          setUserData({
            id:response.data.id,
            email:response.data.email,
            name:response.data.name,
            role:response.data.role,
            profile_img:response.data.profile_img,
          });
        }

      } catch(error){
        console.log(error);
      }
      
    }
    fetchUserData();
  },[emailrefStorage]);

  useEffect(() => {
    const fetchProgress = async () => {
      try{
        const response = await backend.get(`/progress/checkCourseProgress/${enrollmentId}`);

        if(response.status === 200){
          const pretest = response.data.results.filter(item => item.type === "pre");
          const posttest = response.data.results.filter(item => item.type === "post");
          const lab = response.data.results.filter(item => item.type.includes("lab"));

          setProgress({ pretest, posttest, lab });
        }
        
      } catch(error) {
        console.log(error);
      }
      
    }

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
            All Subject
          </p>
        </div>

        <div className={style["subjectlist-wrap"]}>
          {subjectList.map((subject, ind) => {
            const subjectProgress = progress.lab.find(prog => prog.subjectId === subject.id);
            const isCompleted = subjectProgress?.is_completed === 1;

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
            {isPreTestCompleted ? `PreTest Score: ${preTestScore} / ${progress.pretest.length}` : "PreTest"}
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
                ? "PostTest" : "Complete all Labs to unlock PostTest"
            }
          </p>
        </div>

      </div>
    </div>
  );
}

export default NavSubject;
