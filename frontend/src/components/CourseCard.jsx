import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';

import style from './css/coursecard.module.css'
import Processbar from './Processbar';
import backend from '../api/backend';

function CourseCard({ id, name, detail, icon_id, HistoryId }) {

  const [data, setData] = useState({
    email:'',
    name:'',
    role:'',
  })
  const [buttonText, setButtonText] = useState('');
  const [latestProgress, setLastestProgress] = useState('');
  const [ imgPath, setImgPath ] = useState('');
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
          setData({ email: response.data.result[0].Email, name: response.data.result[0].Name, role: response.data.result[0].Role })
        }

      } catch (error) {
        console.log(error);
      }
    }
  }

  useEffect(() => {
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
}, [id, icon_id]);

  useEffect(() => {
    if (!token) {
      setButtonText('View');
    } 
    else if (HistoryId) {
      setButtonText('Continue');
    } 
    else {
      setButtonText('Start');
    }

    decodeAuthToken(token);
  }, [token, HistoryId]);
  console.log(imgPath)
  const handleClick = (status) =>{
    if ( status === 'Continue' ) {
      const fetchLatestProgress = async () =>{
        try{
          const response = await backend.get(`/progress/getLatestProgress/${HistoryId}`);

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
      const registerHistory = async () =>{
        try{
          const response = await backend.post(`/history/registerHistory`, {courseId: id, email: data.email});
          
          if(response.status === 200){
            navigate(`/course/${id}/pretest/-`);
          }
        } catch (error) {
          console.log(error);
        }
      }

      registerHistory();
    } 
    
    else {
      navigate(`/course/${id}`);
    }
  }

  return (
    <div className={style.card}>
      <div className={style["card-wrap"]}>
        <div className={style.content}>
          <img
            alt='Icon Image'
            src={imgPath}
          />
          
          <div className={style.infoContent}>
              <h1>{name}</h1>
              <p>{detail}</p>
          </div>
        </div>

        <Processbar
          courseId={id}
          historyId={HistoryId}
        />

        <button onClick={() => handleClick(buttonText)}>{buttonText}</button>
      </div>
    </div>
  )
}

export default CourseCard