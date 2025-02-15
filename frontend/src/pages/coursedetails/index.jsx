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
        id:null,
        email:null,
        name:null,
        role:null,
        profile_img:null,
    });
    const [ imgPath, setImgPath ] = useState('');
    const navigate = useNavigate();
    const emailrefStorage = localStorage.getItem("email");
 
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
    },[]);

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
    }, [courseId]);

    useEffect(() => {
      const fetchIcon = async () => {
    
        try {
          const response = await backend.get(`/imgrender/getIcon/${courseId}/${courseInfo.icon}`);
          if (response.status === 200) {
            setImgPath(`${import.meta.env.VITE_API_BASE_URL}${response.data.url}`);
          }
        } catch (err) {
          console.log("Error fetching icon:", err);
        }
      };
    
      fetchIcon();
    }, [courseId, courseInfo.icon]);
    
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
          src={imgPath}
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
                {subject.name}
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