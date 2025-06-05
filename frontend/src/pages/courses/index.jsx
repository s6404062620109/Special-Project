import React, { useContext, useEffect, useState } from 'react'
import backend from '../../api/backend';
import { AuthContext } from '../../context/AuthProvider';

import style from './css/courses.module.css'
import CourseData from './CourseData';

function Courses() {
  const { userData } = useContext(AuthContext);
  const [ courses, setCourses ] = useState([]);
  const [ progress, setProgress ] = useState([]);

  const fetchData = async () => {
    try {
      const response = await backend.get('/courses/getCourses');

      if(response.status === 200){
        setCourses(response.data.results);
      }

      if (userData.id) {
        const response = await backend.get(`/enroll/checkCoursesEnroll/${userData.id}`, {
          withCredentials: true,
        });
        if(response.status === 200){
          setProgress(response.data.results);
        }
      }

    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [userData]);

  return (
    <div className={style.pageWrapper}>
      <div className={style.content}>
        <div className={style.head}>
          <p>COURSES</p>
        </div>

        <div className={style.courseTable}>
          <table>
            <thead>
              <tr>
                <th></th>
                {userData.id && (
                  <th>
                    <p>Status</p>
                  </th>
                )}
                {userData.id && (
                  <th>
                    <p>Completion</p>
                  </th>
                )}
                <th></th>
              </tr>
            </thead>
            <tbody>
              {courses.map((item) => (
                <tr
                  className={style["course-name"]}
                  key={item.CourseID}
                >
                  {item.Name}
                </tr>
              ))}

              {courses.map((item) => {
                const courseEnrollments = progress.filter((p) => p.courseId === item.id);
                const latestEnroll = courseEnrollments.at(-1);

                return (
                  <CourseData
                    key={item.id}
                    id={item.id}
                    name={item.name}
                    icon={item.icon}
                    enrollmentId={latestEnroll?.id || null} 
                    courseId={item.id}
                  />
                );
              })}
            </tbody>
          </table>
          
        </div>
      </div>
    </div>
  )
}

export default Courses