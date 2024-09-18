import React, { useEffect, useState } from 'react'
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

import style from './css/coursecard.module.css'

function CourseCard({name, detail, icon_id}) {
  const [userData, setUserdata] = useState({
    email:'',
    name:''
  })
  const [mode, setMode] = useState(false);
  const token = localStorage.getItem('authToken');
  const navigate = useNavigate(); 

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
    if (userData.email) {
      const fetchData = async () => {
        try {
          const response = await axios.get(`http://localhost:3001/updateCourses/${userData.email}`);
          console.log(response)
        } catch (err) {
          if (err.response) {
            console.log(`Error status: ${err.response.status}`);
            if (err.response.status === 301) {
              console.log('No courses found for the user');
            }
          } else {
            console.log(err);
          }
        }
      };

      fetchData();
    }
  }, [userData.email]);

  return (
    <div className={style.card}>
        <img
            alt='Icon Image'
            src={`./Course_Assets/${icon_id}.png`}
        />
        <div className={style.infoContent}>
            <h1>{name}</h1>
            <p>{detail}</p>
        </div>
    </div>
  )
}

export default CourseCard