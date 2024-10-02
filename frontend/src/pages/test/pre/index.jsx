import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

import style from './css/pretest.module.css';

function Pretest() {
  const { courseId } = useParams();
  const [questionsWithChoices, setQuestionsWithChoices] = useState([]);
  const [selectedAnswers, setSelectedAnswers] = useState({});

  const shuffleArray = (array) => {
    return array
      .map((value) => ({ value, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ value }) => value);
  };

  useEffect(() => {
    const fetchData = async () => {
      try{
        const response = await axios.get(`http://localhost:3001/getPretest/${courseId}`);
        console.log(response);

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

          const labeledChoices = shuffleArray(choices).map((choice, idx) => ({
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
      }
      catch(err){
        console.log(err);
      }
    }

    fetchData();
  }, [courseId])

  const handleAnswerChange = (questionId, answerId) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: answerId,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log(selectedAnswers);
    // try {
    //   const payload = {
    //     courseId,
    //     answers: selectedAnswers, // Submit selected answers
    //   };
    //   const response = await axios.post('http://localhost:3001/submitPretest', payload);
    //   console.log('Submit response:', response.data);
    // } catch (err) {
    //   console.error('Error submitting answers:', err);
    // }
  };


  return (
    <div className={style.container}>
      <h1>Pretest</h1>

      <form onSubmit={handleSubmit}>
        {questionsWithChoices.map((question, index) => (
          <div key={index} className={style.testCard}>
            <h3>{question.Question}</h3>
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
                    />
                    {String.fromCharCode(65 + idx)}.
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