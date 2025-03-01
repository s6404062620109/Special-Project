import React, { useEffect, useState } from "react";

import style from "./css/navsubject.module.css";
import backend from '../../api/backend';

function NavSubject({ subjectList, courseId, enrollmentId }) {

  const [userData, setUserData] = useState({
      id:null,
      email:null,
      name:null,
      role:null,
      profile_img:null,
    });
  const emailrefStorage = localStorage.getItem("email");

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
  
  return (
    <div className={style["Nav-Subject"]}>
      <div className={style["subjectlist"]}>
        <div className={style["subjectlist-title"]}>
          <p>
            All Subject
          </p>
        </div>

        <div className={style["subjectlist-wrap"]}>
          {subjectList.map((subject, ind) => (
            <p
              key={ind}
              onClick={() => window.location.href = `/course/${courseId}/subject/${subject.id}/${enrollmentId}`}
              className={subject.isDone ? style["disabled-subject"] : ""}
            >
              {subject.name}
            </p>
          ))}
        </div>

        <div className={style["testlist-wrap"]}>
          <p>PreTest</p>
          <p>PostTest</p>
        </div>

      </div>
    </div>
  );
}

export default NavSubject;
