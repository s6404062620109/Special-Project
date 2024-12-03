import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import style from './css/pretest.module.css';
import backend from '../../../api/backend';

function Pretest() {
  const { courseId, historyId } = useParams();
  const token = localStorage.getItem('authToken');
  const [userData, setUserdata] = useState({
    email:'',
    name:'',
    role:'',
  });
  const [questionsWithChoices, setQuestionsWithChoices] = useState([]);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const navigate = useNavigate();

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
          setUserdata({ email: response.data.result[0].Email, name: response.data.result[0].Name, role: response.data.result[0].Role })
        }

      } catch (error) {
        console.log(error);
      }
    }
  }

  const handleAnswerChange = (questionId, answerId) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: answerId,
    }));
  };

  useEffect(() => {
    const fetchQuestionData = async () => {
      try {
        decodeAuthToken(token);

        const response = await backend.get(`/getPretest/${courseId}/${historyId}/${userData.email}`);

        if (response.data.history) {
          navigate(`/course/${courseId}/pretest/${response.data.history}`);
          window.location.reload();
          return;
        }

        const questions = response.data.Qustions;
        const choices = response.data.Choices;

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

        const questionIdList = formattedQuestions.map((item) => item.QuestionID);

        if (questionIdList.length > 0 && historyId === '-') {
          const registerProgressResponse = await backend.post(`/registerTestProgress`, {
            questionIdList,
            courseId,
            email: userData.email,
          });
          console.log(registerProgressResponse);
        }
      } catch (err) {
        console.error('Error fetching question data:', err);
      }
    };

    fetchQuestionData();
  }, [courseId, token, userData.email]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await backend.post('/submitPretest', { answer: selectedAnswers, courseId, email: userData.email });

      if(response.status === 200 && response.data.message === "Progress updated successfully"){
        navigate(`/course/${courseId}/subject/${response.data.SubjectID}`);
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