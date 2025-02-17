import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import Processbar from './Processbar';
import backend from '../api/backend';

import style from './css/coursecard.module.css'

function CourseCard({ id, name, detail, icon_id, enrollmentId }) {

  const [userData, setUserData] = useState({
        id:null,
        email:null,
        name:null,
        role:null,
        profile_img:null, 
  });
  const emailrefStorage = localStorage.getItem("email");
  const [ imgPath, setImgPath ] = useState('');
  const [ buttonText, setButtonText ] = useState('');
  const [ history, setHistory ] = useState([]);
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

    const fetchIcon = async () => {
      try {
          const response = await backend.get(`/imgrender/getIcon/${id}/${icon_id}`);
          if (response.status === 200) {
              setImgPath(`${import.meta.env.VITE_API_BASE_URL}${response.data.url}`);
          }
      } catch (err) {
          console.log("Error fetching icon:", err);
      }
    };
    fetchIcon();
  },[emailrefStorage, id, icon_id]);

  useEffect(() => {
    if (!emailrefStorage && !userData.id && !userData.email && !userData.name && !userData.role) {
      setButtonText('View');
    } 
    else if (enrollmentId !== 0) {
      setButtonText('Continue');
    } 
    else {
      setButtonText('Start');
    }

  }, [emailrefStorage, userData, enrollmentId]);

  useEffect(() => {
    
    const fetchHistory = async () => {
      try {
          const response = await backend.get(`/enroll/checkCoursesEnroll/${userData.email}`);
          if (response.status === 200) {
            setHistory(response.data.results);
          }
      } catch (err) {
          console.log("Error fetching icon:", err);
      }
    };
    fetchHistory();
  }, [userData]);
  
  const handleClick = (status) =>{
    if ( status === 'Continue' ) {
      const fetchLatestProgress = async () =>{
        try{
          const response = await backend.get(`/progress/getLatestProgress/${enrollmentId}`);

          if(response.status === 200){
            navigate(`/course/${id}/${response.data.inProgress}`);
          }
        } catch (error) {
          console.log(error);
        }  
      }

      fetchLatestProgress();      
    }

    else if ( status === 'Start') {
      const enrollCourse = async () =>{
        try{
          const response = await backend.post(`/enroll/enrollCourse`, {courseId: id, userId: userData.id});
          
          if(response.status === 200){
            navigate(`/course/${id}/pretest/-`);
          }
        } catch (error) {
          console.log(error);
        }
      }
      enrollCourse();
    } 
    
    else {
      navigate(`/course/${id}`);
    }
  }

  return (
    <tr className={style.card}>
      <td className={style.content}>
        <img alt="Icon Image" src={imgPath} />

        <div className={style.infoContent}>
          <h1>{name}</h1>
          <p>{detail}</p>
        </div>
      </td>

      <td>
        {history.length > 0 ? (
            <>
              {history.map((enroll) => (
                <p>
                  {enroll.pretest_complete === true && 
                  enroll.posttest_complete === true && 
                  enroll.completed_labs === enroll.total_labs && (
                    <>
                      DONE
                    </>
                  )}

                  {enroll.pretest_complete === false || 
                  enroll.posttest_complete === false || 
                  enroll.completed_labs < enroll.total_labs && (
                    <>
                      WORKING
                    </>
                  )}
                </p>
              ))}
            </>
          ):(
            <p>-</p>
          )
        }
      </td>

      <td>
        {history.length > 0 ? (
          <>
            {history.map((enroll) => (
              <Processbar
                pretest_complete={enroll.pretest_complete}
                posttest_complete={enroll.posttest_complete}
                completed_labs={enroll.completed_labs}
                total_labs={enroll.total_labs}
              />
            ))}
          </>
        ):(
          <Processbar 
            pretest_complete={false}
            posttest_complete={false}
            completed_labs={0}
            total_labs={0}
          />
        )}
        
      </td>

      <td>
        <button onClick={() => handleClick(buttonText)}>{buttonText}</button>
      </td>
    </tr>
  )
}

export default CourseCard