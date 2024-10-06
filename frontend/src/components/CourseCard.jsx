import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

import style from './css/coursecard.module.css'

function CourseCard({ id, name, detail, icon_id, update }) {

  const [userData, setUserdata] = useState({
    email:'',
    name:''
  });
  const navigate = useNavigate();
  const token = localStorage.getItem('authToken');
  const lastSubject = Array.isArray(update) && update.length > 0
  ? update.reduce((prev, current) => (prev.value > current.value ? prev : current), update[0])
  : null;

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

  const [buttonText, setButtonText] = useState('');
  useEffect(() => {
    if (!token) {
      setButtonText('View');
    } else if (lastSubject) {
      setButtonText('Continue');
    } else {
      setButtonText('Start');
    }

    decodeAuthToken(token);
  }, [token, lastSubject]);

  const handleClick = (status) =>{
    if ( status === 'Continue' ) {
      let subjectId = lastSubject["Subject-ID"]
      console.log(subjectId)
      navigate(`/course/${id}/subject/${update[length]['Subject-ID']}`);
    }

    else if ( status === 'Start') {
      navigate(`/course/${id}/pretest`);
    } 
    
    else {
      navigate(`/course/${id}`);
    }
  }

  return (
    <div className={style.card}>
        <div className={style.content}>
          <img
            alt='Icon Image'
            src={`./Course_Assets/${icon_id}.png`}
          />
          
          <div className={style.infoContent}>
              <h1>{name}</h1>
              <p>{detail}</p>
          </div>
        </div>

        <div>
          <button onClick={() => handleClick(buttonText)}>{buttonText}</button>
        </div>
    </div>
  )
}

export default CourseCard