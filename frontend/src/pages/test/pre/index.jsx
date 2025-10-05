import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import backend from '../../../api/backend';

import style from './css/pretest.module.css';
import { AuthContext } from '../../../context/AuthProvider';
import TestRead from '../../../components/Reader/TestRead';
import { Button, Typography } from '@mui/material';

function Pretest() {
  const { courseId, enrollmentId } = useParams();
  const { userData } = useContext(AuthContext);
  const [ question, setQuestion ] = useState([]);
  const [ selectedAnswers, setSelectedAnswers ] = useState({});
  const [ errorMessage, setErrorMessage ] = useState('');
  const navigate = useNavigate();

   const checkPretestCompletion = async () => {
    try {
      const response = await backend.get(`/progress/checkCourseProgress/${enrollmentId}/${courseId}`, {
        withCredentials: true
      });

      if (response.status === 200) {
        const pretestProgress = response.data.pretest_progress;

        const pretestCompleted = pretestProgress.every((item) => item.is_completed === 1);

        if(pretestCompleted){
          alert("คุณได้ทำแบบทดสอบก่อนเรียนแล้ว ไม่อนุญาตให้ทำอีกครั้ง");
          navigate(-1);
          return;
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  const fetchPretestData = async () => {
    try{
      const response = await backend.get(`/pretest/getPretest/${enrollmentId}/${courseId}`, {
        withCredentials: true
      });

      if(response.status === 200){
        setQuestion(response.data.questions);
        setSelectedAnswers(
          response.data.questions.reduce((acc, question) => {
            acc[question.qId] = null;
            return acc;
          }, {})
        );
      }
        
    } catch(error){
      console.log(error);
      if(error.response.status === 404){
        alert("Please enroll this course before pretest.");
        navigate('/');
      }
    }
  }

  useEffect(() => {
    if(userData.id===null){
      alert("กรุณาเข้าสู่ระบบก่อน");
      navigate('/');
    }
    if (userData.id !== null) {
      checkPretestCompletion();
    }

    fetchPretestData();
  }, [userData.id, enrollmentId, courseId, navigate]);
 
  const handleAnswerChange = (questionId, answerId, content) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: {
        answerId,
        content
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const checkNullSelectedAnswer = Object.values(selectedAnswers).some(answer => answer === null);

    if(checkNullSelectedAnswer){
      setErrorMessage("กรุณาตอบคำถามทั้งหมด");
      return;
    }
    
    try {
      const response = await backend.put(`/pretest/submitPretest/${courseId}`, { answer: selectedAnswers, enrollmentId }, {
        withCredentials: true
      });

      if(response.status === 200 && response.data.message === "Progress pretest update completed."){
        setErrorMessage("Pretest submitted successfully.");
        setTimeout(() => {
          navigate(`/course/${courseId}/${enrollmentId}`);
        }, 3000);
      }
    } 
    catch (err) {
      console.log(err);
      if(err.response.status === 404){
        setErrorMessage("Please answer all question before submit.");
      }
    }
    
  };
  
  return (
    <div className={style.container}>
      <Typography variant='h4' >แบบทดสอบก่อนเรียน</Typography>

      <form onSubmit={handleSubmit}>

        <TestRead 
          question={question}
          handleAnswerChange={handleAnswerChange}
          selectedAnswers={selectedAnswers}
        />
        
        <Typography 
          variant='body2' 
          fontWeight="semi-bold" 
          color={errorMessage === "Pretest submitted successfully." ? "green" : "red"}
        >
        {errorMessage}
        </Typography>
        
        <Button 
          variant="contained" 
          color="success" 
          type="submit"
        >
          ยืนยันคำตอบ
        </Button>

      </form>

    </div>
  )
}

export default Pretest