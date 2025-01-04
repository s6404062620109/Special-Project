import React, { useEffect, useState } from 'react'

import style from './css/courses.module.css'
import CourseCard from '../../components/CourseCard';
import { useNavigate } from 'react-router-dom';
import backend from '../../api/backend';

function Courses() {
  const [userData, setUserdata] = useState({
    email:'',
    name:'',
    role:'',
  })
  const [data, setData] = useState([]);
  const [updateState, setUpdateState] = useState([]);
  const navigate = useNavigate();
  const token = localStorage.getItem('authToken');

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
          setUserdata({ email: response.data.result[0].Email, name: response.data.result[0].Name, role: response.data.result[0].Role })
        }

      } catch (error) {
        console.log(error);
      }
    }
  }

  useEffect(() => {
    decodeAuthToken(token);
  }, [token])

  useEffect(() => {
    
    const fetchData = async () => {
      try {
        const response = await backend.get('/courses/getCourses');

        if(response.status === 200){
          setData(response.data);
        }

        if (token) {
          const response = await backend.get(`/history/checkCoursesHistory/${userData.email}`);
          if(response.status === 200){
            setUpdateState(response.data.results);
          }
        }
      } catch (err) {
        console.log(err);
      }
    };

    fetchData();
  }, [userData, token]);
  
  const getUpdateStateForCourse = (courseID) => {
    const courseUpdate = updateState.find((state) => state.CourseID === courseID);
    return courseUpdate ? courseUpdate.HistoryID : null;
  };

  return (
    <div className={style.content}>
      <div className={style.head}>COURSES</div>
      <table className={style.courseTable}>
        <thead>
          <tr>
            <th width={'60%'}>Course</th>
            <th>Status</th>
            <th width={'30%'}>Completion</th>
            <th>Button</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <CourseCard
              key={item.CourseID}
              id={item.CourseID}
              name={item.Name}
              detail={item.Detail}
              icon_id={item.Icon_id}
              HistoryId={getUpdateStateForCourse(item.CourseID)}
            />
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default Courses