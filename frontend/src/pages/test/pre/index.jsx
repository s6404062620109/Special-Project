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
        const pretestProgress = response.data.results.filter((item) => item.typeId === 1);

        const areAllPretestsCompleted = pretestProgress.every((item) => item.is_completed === 1);

        if (areAllPretestsCompleted) {
          alert('You already complete all Pretest questions.');
          navigate(`/courses`);
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
      alert("Please login first.");
      navigate('/');
    }
    if (userData.id !== null) {
      checkPretestCompletion();
    }

    fetchPretestData();
  }, [userData.id, enrollmentId, courseId, navigate]);
 
  const handleAnswerChange = (questionId, answerId) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: answerId,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const checkNullSelectedAnswer = Object.values(selectedAnswers).some(answer => answer === null);

    if(checkNullSelectedAnswer){
      setErrorMessage("Please answer all question before submit.");
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
      <h1>Pretest</h1>

      <form onSubmit={handleSubmit}>

        <TestRead 
          question={question}
          handleAnswerChange={handleAnswerChange}
          selectedAnswers={selectedAnswers}
        />
        
        <Typography variant='body2' color={errorMessage === "Pretest submitted successfully." ? "green" : "red"}>{errorMessage}</Typography>
        <Button variant="contained" color="primary" type="submit">Submit Answers</Button>

      </form>

    </div>
  )
}

export default Pretest