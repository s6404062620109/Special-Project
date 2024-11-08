import React, { useEffect, useState } from "react";
import style from "./css/navsubject.module.css";
import axios from "axios";
import { jwtDecode } from 'jwt-decode';

function NavSubject({ courseId }) {
  const [navlist, setNavlist] = useState({
    subjectIds: [],
    subjectNames: [],
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
    const fetchSubject = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3001/getAllSubject/${courseId}`
        );

        const subjectIds = response.data.subject.map(
          (subject) => subject.SubjectID
        );

        const subjectNames = response.data.subject.map(
          (subject) => subject.Name
        );

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
    decodeAuthToken(token);
  }, [courseId, token]);

  useEffect(() => {
    const fetchHistory = async () => {
      try{
        const response = await axios.get(
          `http://localhost:3001/updateCourses/${userData.email}`
        );
        setUserHistories(response.data);
      } catch( error ) {
        console.log(error);
      }
    } 
    fetchHistory();

    let courseHistory = userHistories.filter(
      (history) => history['Course-ID'] === courseId
    );
    setUserHistories(courseHistory);
  }, [userData, courseId]);

  const preTestHistory = userHistories.find(
    (history) => history.Type === "Pre"
  );
  const preTestScore = preTestHistory ? preTestHistory.Score : null;


  return (
    <div className={style["Nav-Subject"]}>
      <ul>
        <li>All Subject</li>

        <div className={style["subjectlist-wrap"]}>
            {navlist.subjectNames.map((name, ind) => (
            <li key={ind}>
                <a
                onClick={() =>
                    (window.location.href = `/course/${courseId}/subject/${navlist.subjectIds[ind]}`)
                }
                >
                {name}
                </a>
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
