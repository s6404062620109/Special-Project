import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import backend from '../../../api/backend';

import style from "./css/posttest.module.css";
import { AuthContext } from '../../../context/AuthProvider';
import TestRead from '../../../components/Reader/TestRead';
import { Button } from '@mui/material';

function PostTest() {
  const { courseId, enrollmentId } = useParams();
  const { userData } = useContext(AuthContext);
  const [ question, setQuestion ] = useState([]);
  const [ selectedAnswers, setSelectedAnswers ] = useState({});
  const navigate = useNavigate();
  
  const checkLabCompletion = async () => {
    try {
      const response = await backend.get(`/progress/checkCourseProgress/${enrollmentId}/${courseId}`, {
        withCredentials: true
      });

      if (response.status === 200) {
        const labProgress = response.data.results.filter(item => item.type.includes("Lab"));

        const areAllLabsCompleted = labProgress.every(item => item.is_completed === 1);

        if (!areAllLabsCompleted) {
          alert("You must complete all Labs before taking the PostTest.");
          navigate(`/courses`);
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
    try {
      const response = await backend.put(`/posttest/submitPosttest/${courseId}`, { answer: selectedAnswers, enrollmentId }, {
        withCredentials: true
      });

      if (response.status === 200 ) {
        navigate('/courses');
      }
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className={style.container}>
      <h1>Posttest</h1>

      <form onSubmit={handleSubmit}>
        <TestRead 
          question={question}
          handleAnswerChange={handleAnswerChange}
          selectedAnswers={selectedAnswers}
        />

        <Button variant="contained" color="primary" type="submit">Submit Answers</Button>
      </form>
    </div>
  );
}

export default PostTest;
