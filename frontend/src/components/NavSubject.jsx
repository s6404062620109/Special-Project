import React, { useEffect, useState } from "react";

import style from "./css/navsubject.module.css";
import backend from '../api/backend';

function NavSubject({ subjectList, courseId }) {

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
      <ul>
        <li>All Subject</li>

        <div className={style["subjectlist-wrap"]}>
          {subjectList.map((subject, ind) => (
            <li
              key={ind}
              onClick={() => {
                if (!subject.isDone) {
                  window.location.href = `/course/${courseId}/subject/${subject.id}`;
                }
              }}
              className={subject.isDone ? style["disabled-subject"] : ""}
            >
              <a>{subject.name}</a>
            </li>
          ))}
        </div>

      </ul>
    </div>
  );
}

export default NavSubject;
