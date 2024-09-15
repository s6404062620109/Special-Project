import React, { useEffect, useState } from 'react'
import axios from 'axios';

import style from './css/courses.module.css'
import CourseCard from '../../components/CourseCard';

function Courses() {
  const [data, setData] = useState([]);

  useEffect(() => {

    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:3001/getCourses');
        console.log(response.data);
        setData(response.data);
      } catch (err) {
        console.log(err);
      }
    };

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