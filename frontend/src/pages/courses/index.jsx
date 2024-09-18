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

    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:3001/getCourses');
        // console.log(response.data);
        setData(response.data);
      } catch (err) {
        console.log(err);
      }
    };

    decodeAuthToken(token)
    fetchData();
  }, []);

  return (
    <div className={style.content}>
      {data.map(item => (
        <CourseCard
          key={item.CourseID}
          name={item.Name}
          detail={item.Detail}
          icon_id={item.Icon_id}
        />
      ))}
    </div>
  )
}

export default Courses