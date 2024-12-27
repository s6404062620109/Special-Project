import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import style from './css/coursedetails.module.css'
import backend from '../../api/backend';

function CourseDetail() {

    const { courseId } = useParams();
    const [ data, setData ] = useState([]);
    const [ courseInfo, setCourseInfo] = useState({
      id: '',
      name:'',
      details:'',
      icon:''
    });
    const [userData, setUserData] = useState({
      email:'',
      name:'',
      role:'',
    })
    
    const token = localStorage.getItem('authToken');
    const navigate = useNavigate();

    useEffect(() => {
      const fetchData = async () => {
        try {
          const response = await backend.get(`/subjects/getAllSubject/${courseId}`);
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
            setUserData({ email: response.data.result[0].Email, name: response.data.result[0].Name, role: response.data.result[0].Role })
          }
  
        } catch (error) {
          console.log(error);
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
        navigate('/');
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