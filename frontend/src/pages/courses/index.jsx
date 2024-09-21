import React, { useEffect, useState } from 'react'
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

import style from './css/courses.module.css'
import CourseCard from '../../components/CourseCard';

function Courses() {
  const [userData, setUserdata] = useState({
    email:'',
    name:''
  })
  const [data, setData] = useState([]);
  const [updateState, setUpdateState] = useState([]);

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
    decodeAuthToken(token)
  }, [token])

  useEffect(() => {
    
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:3001/getCourses');
        setData(response.data);

        if (token) {
          const Updateresponse = await axios.get(`http://localhost:3001/updateCourses/${userData.email}`);
          setUpdateState(Updateresponse.data);
        }
      } catch (err) {
        console.log(err);
      }
    };

    fetchData();
  }, [userData.email]);

  const matchingUpdates = (courseId)  => {
    if (!token || updateState.length === 0) {
      return null;
    }

    const states = updateState.filter(update => update['Course-ID'] === courseId);
    return states
  };

  return (
    <div className={style.content}>
      {data.map(item => (
        <CourseCard
          key={item.CourseID}
          id={item.CourseID}
          name={item.Name}
          detail={item.Detail}
          icon_id={item.Icon_id}
          update={matchingUpdates(item.CourseID)}
        />
      ))}
    </div>
  )
}

export default Courses