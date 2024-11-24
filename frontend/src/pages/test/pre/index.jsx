import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { jwtDecode } from 'jwt-decode';

import style from './css/pretest.module.css';

function Pretest() {
  const { courseId } = useParams();
  const token = localStorage.getItem('authToken');
  const [userData, setUserdata] = useState({
    email:'',
    name:''
  });
  const [questionsWithChoices, setQuestionsWithChoices] = useState([]);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const navigate = useNavigate();

  const decodeAuthToken = (Authtoken) =>{
    if(!Authtoken){
      console.log('Not authentication.');
      return
    }
    else{
      const decodedToken = jwtDecode(Authtoken);
      const currentTime = Date.now() / 1000;
      if (decodedToken.exp < currentTime) {
        localStorage.removeItem('authToken');
        console.log('Token expired. Logging out.');
        navigate('/login'); 
      }
      else{
        setUserdata({
          email: decodedToken.email,
          name: decodedToken.name
        })
      }
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      try{
        const response = await axios.get(`http://localhost:3001/getPretest/${courseId}`);
        console.log(response)

        let questions = response.data.Qustions;
        let choices = response.data.Choices;

        const choicesByQuestionId = choices.reduce((acc, choice) => {
          if (!acc[choice.QuestionID]) {
            acc[choice.QuestionID] = [];
          }
          acc[choice.QuestionID].push({
            AnswerID: choice.AnswerID,
            result: choice.result.trim(),
          });
          return acc;
        }, {});

        const formattedQuestions = questions.map((question) => {
          let choices = choicesByQuestionId[question.QuestionID] || [];

          const labeledChoices = choices.map((choice, idx) => ({
            ...choice,
            label: String.fromCharCode(65 + idx), 
          }));

          return {
            QuestionID: question.QuestionID,
            Question: question.Question,
            choices: labeledChoices,
          };
        });

        setQuestionsWithChoices(formattedQuestions);
      } catch(err){
        console.log(err);
      }
    }

    decodeAuthToken(token);
    fetchData();
  }, [courseId, token])

  const handleAnswerChange = (questionId, answerId) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: answerId,
    }));
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        courseId,
        answers: selectedAnswers,
      };

      const response = await axios.post('http://localhost:3001/submitPretest', {payload: payload, courseid: courseId, email: userData.email});
      console.log('Submit response:', response.data);

      navigate(`/course/${courseId}/subject/${response.data.subjectId}`);
    } 
    catch (err) {
      console.log('Error submitting answers:', err);

    }

    
  };


  return (
    <div className={style.container}>
      <h1>Pretest</h1>

      <form onSubmit={handleSubmit}>

        {questionsWithChoices.map((question, index) => (
          <div key={index} className={style.testCard}>
            <h3>{index+1}. {question.Question}</h3>

            <ul>
              {question.choices.map((choice, idx) => (
                <li key={idx}>
                  <label>
                    <input
                      type="radio"
                      name={`question-${question.QuestionID}`}
                      value={choice.AnswerID}
                      checked={selectedAnswers[question.QuestionID] === choice.AnswerID}
                      onChange={() => handleAnswerChange(question.QuestionID, choice.AnswerID)}
                      required
                    />
                    {choice.label}.
                    {choice.result}
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