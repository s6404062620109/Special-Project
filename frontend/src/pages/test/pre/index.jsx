import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import backend from '../../../api/backend';

import style from './css/pretest.module.css';


function Pretest() {
  const { courseId, enrollmentId } = useParams();
  const [questionsWithChoices, setQuestionsWithChoices] = useState([]);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [userData, setUserData] = useState({
    id:null,
    email:null,
    name:null,
    role:null,
    profile_img:null, 
  });
  const emailrefStorage = localStorage.getItem("email");
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
    if(userData.id!==null){
      const fetchPretestData = async () => {
        try{
          const response = await backend.get(`/pretest/getPretest/${enrollmentId}/${userData.id}`);
          
          if(response.status === 200){
            setQuestionsWithChoices(response.data.questions);
          }
          
        } catch(error){
          console.log(error);
        }
      }
      fetchPretestData();
    }
  }, [enrollmentId, userData.id]);

  const handleAnswerChange = (questionId, answerId) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: answerId,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(selectedAnswers);
    try {
      const response = await backend.put('/pretest/submitPretest', { answer: selectedAnswers, enrollmentId });

      if(response.status === 200 && response.data.message === "Progress pretest update completed."){
        navigate(`/course/${courseId}/subject/${response.data.firstSubject}`);
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