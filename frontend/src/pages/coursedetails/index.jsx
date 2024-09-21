import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import axios from 'axios';

import style from './css/coursedetails.module.css'

function CourseDetail() {
    const { courseId } = useParams();
    const [ data, setData ] = useState([]);
    const [ courseInfo, setCourseInfo ] = useState({
      name:'',
      details:'',
      icon:''
    });
    
    useEffect(() => {
      const fetchData = async () => {
        try {
          const response = await axios.get(`http://localhost:3001/getAllSubject/${courseId}`);
          setData(response.data);
        } catch (err) {
          console.log(err);
        }
      };

      fetchData();
    }, [courseId])

    useEffect(() => {
      if (data.length > 0) {
        setCourseInfo({
          name: data[0].courseName,
          details: data[0].courseDetail,
          icon: data[0].courseIcon,
        });
      }
    }, [data]);

    console.log(data)
    
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
              to={``} 
            >
                {subject.Name}
            </Link>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default CourseDetail