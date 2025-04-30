import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import backend from '../../../api/backend';

import style from './css/pretest.module.css';
import { AuthContext } from '../../../context/AuthProvider';


function Pretest() {
  const { courseId, enrollmentId } = useParams();
  const { userData } = useContext(AuthContext);
  const [questionsWithChoices, setQuestionsWithChoices] = useState([]);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    if (userData.id !== null) {
      const checkPretestCompletion = async () => {
        try {
          const response = await backend.get(`/progress/checkCourseProgress/${enrollmentId}`);

          if (response.status === 200) {
            const pretestProgress = response.data.results.filter(
              (item) => item.type === 'Pre'
            );

            const areAllPretestsCompleted = pretestProgress.every(
              (item) => item.is_completed === 1
            );

            if (areAllPretestsCompleted) {
              alert('You already complete all Pretest questions.');
              navigate(`/courses`);
            }
          }
        } catch (error) {
          console.log(error);
        }
      };

      checkPretestCompletion();
    }
  }, [userData.id, enrollmentId, courseId, navigate]);

  useEffect(() => {
    if(userData.id===null){
      alert("Please login first.");
      navigate('/');
    }

    const fetchPretestData = async () => {
      try{
        const response = await backend.get(`/pretest/getPretest/${enrollmentId}/${userData.id}`);
        console.log(response)
        if(response.status === 200){
          setQuestionsWithChoices(response.data.questions);
        }
          
      } catch(error){
        console.log(error);
        if(error.response.status === 404){
          alert("Please enroll this course before pretest.");
          navigate('/');
        }
      }
    }
    fetchPretestData();
  }, [enrollmentId, userData.id]);

  const handleAnswerChange = (questionId, answerId) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: answerId,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await backend.put('/pretest/submitPretest', { answer: selectedAnswers, enrollmentId });

      if(response.status === 200 && response.data.message === "Progress pretest update completed."){
        navigate(`/course/${courseId}/subject/${response.data.firstSubject}/${enrollmentId}`);
      }
      
    } 
    catch (err) {
      console.log(err);
    }
    
  };
  
  return (
    <div className={style.container}>
      <h1>Pretest</h1>

      <form onSubmit={handleSubmit}>

        {questionsWithChoices.map((question, index) => (
          <div key={index} className={style.testCard}>
            <h3>{index+1}. {question.question}</h3>

            <ul>
              {question.choices.map((choice, idx) => (
                <li key={idx}>
                  <label>
                    <input
                      type="radio"
                      name={`question-${question.qId}`}
                      value={choice.aId}
                      checked={selectedAnswers[question.qId] === choice.aId}
                      onChange={() => handleAnswerChange(question.qId, choice.aId)}
                      required
                    />
                    {choice.label}
                  </label>
                </li>
              ))}
            </ul>
          </div>
        ))}
        
        <button type="submit">Submit Answers</button>

      </form>

    </div>
  )
}

export default Pretest