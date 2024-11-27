import React, { useEffect, useState } from 'react'
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

import style from './css/courses.module.css'
import CourseCard from '../../components/CourseCard';
import { useNavigate } from 'react-router-dom';

function Courses() {
  const [userData, setUserdata] = useState({
    email:'',
    name:''
  })
  const [data, setData] = useState([]);
  const [updateState, setUpdateState] = useState([]);
  const navigate = useNavigate();
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
  }, [token])

  useEffect(() => {
    
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:3001/getCourses');
        setData(response.data);

        if (token) {
          const courseProgressResponse = await axios.get(`http://localhost:3001/checkCoursesProgress/${userData.email}`);
          setUpdateState(courseProgressResponse.data.results);
        }
      } catch (err) {
        console.log(err);
      }
    };

    fetchData();
  }, [userData]);
  
  const getUpdateStateForCourse = (courseID) => {
    const courseUpdate = updateState.find((state) => state.CourseID === courseID);
    return courseUpdate ? courseUpdate.HistoryID : null;
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
          update={getUpdateStateForCourse(item.CourseID)}
        />
      ))}
    </div>
  )
}

export default Courses