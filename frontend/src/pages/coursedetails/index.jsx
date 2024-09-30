import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import axios from 'axios';

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
            >
                {subject.Name}
            </Link>
          ))}
        </ul>

        <ul>
          <Link to={`/course/${courseId}/pretest`}>Pretest</Link>
          <Link>Posttest</Link>
        </ul>
      </div>
    </div>
  )
}

export default CourseDetail