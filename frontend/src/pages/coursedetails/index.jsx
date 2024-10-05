import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

import style from './css/coursedetails.module.css'

function CourseDetail() {

    const { courseId } = useParams();
    const [ data, setData ] = useState([]);
    const [ courseInfo, setCourseInfo] = useState({
      id: '',
      name:'',
      details:'',
      icon:''
    });
    const [userData, setUserdata] = useState({
      email:'',
      name:''
    })
    
    const token = localStorage.getItem('authToken');
    const navigate = useNavigate();

    useEffect(() => {
      const fetchData = async () => {
        try {
          const response = await axios.get(`http://localhost:3001/getAllSubject/${courseId}`);
          // console.log(response)
          let responseCourse = response.data.courseInfo[0]

          setCourseInfo({
            id: responseCourse.CourseID,
            name: responseCourse.Name,
            details: responseCourse.Detail,
            icon: responseCourse.Icon_id
          });
          setData(response.data.subject);
        } catch (err) {
          console.log(err);
        }
      };

      fetchData();
    }, [courseId])

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
    
    const handleLinkClick = (e) => {
      if (!token) {
        e.preventDefault();
        alert('Not authenticated. Please log in.');
        navigate('/login');
      }
    }

  return (
    <div className={style.container}>
      <div className={style.head}>
        <img
          alt='Course Icon Image'
          src={`/Course_Assets/${courseInfo.icon}.png`}
        />
        <div className={style.infoContent}>
          <h1>{courseInfo.name}</h1>
          <label>{courseInfo.details}</label>
        </div>
      </div>

      <div className={style.content}>
        <ul>
          {data.map((subject, index) => (
            <Link 
              key={index}
              to={`/course/${courseId}/subject/${subject.SubjectID}`}
              onClick={handleLinkClick} 
            >
                {subject.Name}
            </Link>
          ))}
        </ul>

        <ul>
          <Link 
            to={`/course/${courseId}/pretest`}
            onClick={handleLinkClick}
          >
            Pretest
          </Link>
          <Link
            onClick={handleLinkClick}  
          >
            Posttest
          </Link>
        </ul>
      </div>
    </div>
  )
}

export default CourseDetail