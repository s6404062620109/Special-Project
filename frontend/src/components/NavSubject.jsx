import React, { useEffect, useState } from "react";

import style from "./css/navsubject.module.css";
import backend from '../api/backend';

function NavSubject({ courseId }) {
  const [navlist, setNavlist] = useState({
    subjectIds: [],
    subjectNames: [],
    subjectDone: [],
    Pretest: `/course/${courseId}/pretest`,
    Posttest: ``,
  });
  const [userData, setUserdata] = useState({
    email:'',
    name:''
  });
  const [userHistories, setUserHistories] = useState([]);

  const token = localStorage.getItem('authToken');

  const decodeAuthToken = async (token) => {
    if(!token){
      console.log('Not authentication.');
      return
    }
    else{
      try{
        const response = await backend.get('/auth/authorization', {
          headers: {
            'Authorization': `Bearer ${token}`
          } 
        });

        if(response.status === 200){
          setUserdata({ email: response.data.result[0].Email, name: response.data.result[0].Name, role: response.data.result[0].Role })
        }

      } catch (error) {
        console.log(error);
      }
    }
  }

  useEffect(() => {
    decodeAuthToken(token);
  }, [token]);

  useEffect(() => {
    const fetchSubject = async () => {
      try {
        const response = await backend.get( `/subjects/getAllSubject/${courseId}` );

        const subjectIds = response.data.subject.map( (subject) => subject.SubjectID );

        const subjectNames = response.data.subject.map( (subject) => subject.Name );
        
        setNavlist((prev) => ({ 
          ...prev,
          subjectIds: subjectIds,
          subjectNames: subjectNames,
        }));
      } catch (error) {
        console.log(error);
      }
    };
    fetchSubject();
    
  }, [userData,courseId]);

  const subjectStates = navlist.subjectIds.map((subjectId, index) => ({
    subjectId,
    isDone: navlist.subjectDone.includes(subjectId),
    name: navlist.subjectNames[index]
  }));

  return (
    <div className={style["Nav-Subject"]}>
      <ul>
        <li>All Subject</li>

        <div className={style["subjectlist-wrap"]}>
          {subjectStates.map((subject, ind) => (
            <li
              key={ind}
              onClick={() => {
                if (!subject.isDone) {
                  window.location.href = `/course/${courseId}/subject/${subject.subjectId}`;
                }
              }}
              className={subject.isDone ? style["disabled-subject"] : ""}
            >
              <a>{subject.name}</a>
              <a>{subject.isDone && (
                <>PASS</>
              )}</a>
            </li>
          ))}
        </div>

        <div className={style["testlist-wrap"]}>
          <li 
            className={style.testlist}
            onClick={() => (window.location.href = navlist.Pretest)}
          >
            Pre-Test
          </li>
              
          <li 
            className={style.testlist}
            onClick={() => (window.location.href = navlist.Posttest)}
          >
            Post-Test
          </li>
        </div>
      </ul>
    </div>
  );
}

export default NavSubject;
