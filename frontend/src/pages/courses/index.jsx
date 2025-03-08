import React, { useEffect, useState } from 'react'

import style from './css/courses.module.css'
import CourseCard from './CourseCard';
import { useNavigate } from 'react-router-dom';
import backend from '../../api/backend';

function Courses() {
  const [userData, setUserData] = useState({
      id:null,
      email:null,
      name:null,
      role:null,
      profile_img:null,
  });
  const emailrefStorage = localStorage.getItem("email");
  const [data, setData] = useState([]);
  const [progress, setProgress] = useState([]);
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchUserData = async () => {
      try{
        const response = await backend.get(`/auth/authorization/${emailrefStorage}`, {
          withCredentials: true
        });
        if(response.status === 200){
          setUserData({
            id:response.data.id,
            email:response.data.email,
            name:response.data.name,
            role:response.data.role,
            profile_img:response.data.profile_img,
          });
        }

      } catch(error){
        console.log(error);
      }
      
    }
    fetchUserData();
  },[emailrefStorage]);

  useEffect(() => {
    
    const fetchData = async () => {
      try {
        const response = await backend.get('/courses/getCourses');

        if(response.status === 200){
          setData(response.data);
        }

        if (userData.id) {
          const response = await backend.get(`/enroll/checkCoursesEnroll/${userData.id}`);
          if(response.status === 200){
            setProgress(response.data.results);
          }
        }
      } catch (err) {
        console.log(err);
      }
    };

    fetchData();
  }, [userData]);

  return (
    <div className={style.content}>
      <div className={style.head}>
        <p>COURSES</p>
      </div>

      <div className={style.courseTable}>
        <table>
          <thead>
            <tr>
              <th></th>
              <th>
                <p>Status</p>
              </th>
              <th>
                <p>Completion</p>
              </th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr
                className={style["course-name"]}
                key={item.CourseID}
              >
                {item.Name}
              </tr>
            ))}

            {data.map((item) => {
              const enrollment = progress.find((p) => p.courseId === item.id);
              return (
                <CourseCard
                  key={item.id}
                  id={item.id}
                  name={item.name}
                  icon_id={item.icon_id}
                  enrollmentId={enrollment ? enrollment.id : null}
                  courseId={item.id}
                />
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Courses