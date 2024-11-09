import React, { useEffect, useState } from "react";
import style from "./css/navsubject.module.css";
import axios from "axios";
import { jwtDecode } from 'jwt-decode';

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

  const decodeAuthToken = (Authtoken) =>{
    if(!Authtoken){
      console.log('Not authentication.');
      return
    }
    else{
      const decodedToken = jwtDecode(Authtoken);
      const currentTime = Date.now() / 1000;
      if (decodedToken.exp < currentTime) {
        localStorage.removeItem('authToken');
        console.log('Token expired. Logging out.');
        navigate('/login'); 
      }
      else{
        setUserdata({
          email: decodedToken.email,
          name: decodedToken.name
        })
      }
    }
  }

  useEffect(() => {
    decodeAuthToken(token);
  }, [token]);

  useEffect(() => {
    const fetchSubject = async () => {
      try {
        const response = await axios.get( `http://localhost:3001/getAllSubject/${courseId}` );

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

    const fetchHistory = async () => {
      try{
        const response = await axios.get( `http://localhost:3001/checkScore/${userData.email}/${courseId}` );
        setUserHistories(response.data.result);

      } catch( error ) {
        console.log(error);
      }
    } 
    fetchHistory();

    let courseHistory = userHistories.filter( (history) => history['Course-ID'] === courseId );
    setUserHistories(courseHistory);
    
  }, [userData,courseId]);
  
  useEffect(() => {
    const disableSubject = userHistories.filter((history) => history.Type.includes("lab"));
    setNavlist((prev) => ({
      ...prev, 
      subjectDone: disableSubject.map((subject) => subject["Subject-ID"])
    }));
  }, [userHistories]);

  const preTestHistory = userHistories.find(
    (history) => history.Type === "Pre"
  );
  const preTestScore = preTestHistory ? preTestHistory.Score : null;

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
            {preTestHistory ? (
              <li className={style["disable-Pretest"]}>
                <label>Pretest</label>
                <label>{preTestScore}</label>
              </li>
            ) : (
              <li 
                className={style.testlist}
                onClick={() => (window.location.href = navlist.Pretest)}
              >
                Pre-Test
              </li>
            )} 
              
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
