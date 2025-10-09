import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import backend from '../../../api/backend';

import style from "./css/posttest.module.css";
import { AuthContext } from '../../../context/AuthProvider';
import TestRead from '../../../components/Reader/TestRead';
import { Button, Typography } from '@mui/material';

function PostTest() {
  const { courseId, enrollmentId } = useParams();
  const { userData } = useContext(AuthContext);
  const [ question, setQuestion ] = useState([]);
  const [ errorMessage, setErrorMessage ] = useState("");
  const [ selectedAnswers, setSelectedAnswers ] = useState({});
  const navigate = useNavigate();
  
  const checkLabCompletion = async () => {
    try {
      const response = await backend.get(`/progress/checkCourseProgress/${enrollmentId}/${courseId}`, {
        withCredentials: true
      });

      if (response.status === 200) {
        const pretestProgress = response.data.pretest_progress;
        const labProgress = response.data.lab_progress;

        const pretestCompleted = pretestProgress.every((item) => item.is_completed === 1);
        const labCompleted = labProgress.every((item) => item.is_completed === 1);

        if(!pretestCompleted && !labCompleted){
          alert("กรุณาทำแบบทดสอบก่อนเรียน และปฎิบัติการทดสอบทั้งหมดก่อน");
          navigate(-1);
          return;
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  const fetchPosttestData = async () => {
    try {
      const response = await backend.get(`/posttest/getPosttest/${enrollmentId}/${courseId}`, {
        withCredentials: true
      });

      if (response.status === 200) {
        setQuestion(response.data.questions);
        setSelectedAnswers(
          response.data.questions.reduce((acc, question) => {
            acc[question.qId] = null;
            return acc;
          }, {})
        );
      }
    } catch (error) {
      console.log(error);
      if(error.response.status === 404){
        alert("Please enroll this course before posttest.");
        navigate('/');
      }
    }
  };

  useEffect(() => {
    localStorage.removeItem("selector-question-type");
    if (userData.id === null) {
      alert("Please login first.");
      navigate('/');
    }
    if (userData.id !== null) {
      checkLabCompletion();
    }

    fetchPosttestData();
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
      const response = await backend.put(`/posttest/submitPosttest/${courseId}`, { answer: selectedAnswers, enrollmentId }, {
        withCredentials: true
      });

      if (response.status === 200 ) {
        setErrorMessage("ส่งคำตอบเสร็จสิ้น");
        setTimeout(() => {
          navigate(`/course/${courseId}/${enrollmentId}`);
        }, 3000);
      }
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className={style.container}>
      <Typography variant='h4' >แบบทดสอบหลังเรียน</Typography>
      <form onSubmit={handleSubmit}>
        <TestRead 
          question={question}
          handleAnswerChange={handleAnswerChange}
          selectedAnswers={selectedAnswers}
        />

        <Button 
          variant="contained" 
          color="success" 
          type="submit"
        >
          ยืนยันคำตอบ
        </Button>
      </form>
    </div>
  );
}

export default PostTest;
