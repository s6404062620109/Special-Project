import React, { useEffect, useState } from 'react'

import style from './css/processbar.module.css';
import backend from '../api/backend';

/* Cal Percent */

 // pre / post test = 1;
 // maxlabscore = 8;
 // maxlavscore & pre&post = 10;

/* Cal Percent */

function Processbar({ courseId, historyId }) {
    const [ percent, setPercent ] = useState(0);
    const [ subjectList, setSubjectList ] = useState([]);
    const [ progress, setProgress ] = useState([]);
    
    useEffect(() => {
        const fetchSubject = async () =>{
            try{
                const response = await backend.get(`/subjects/getAllSubject/${courseId}`);
                if(response.status === 200){
                    let subjectIds = response.data.subject.map(subject => subject.SubjectID);
                    setSubjectList(subjectIds);
                }
            } catch (error) {
                console.log(error);
            }
        }

        fetchSubject();
    }, [courseId]);

    useEffect(() => {
        const fethProgress = async () => {
            try{
                const response = await backend.get(`/progress/checkCourseProgress/${historyId}`);
                if(response.status === 200){
                    setProgress(response.data.results);
                }
            } catch (error) {
                console.log(error);
            } 
        }

        fethProgress();
    }, [historyId]);

    useEffect(() => {
        if (progress.length > 0 && subjectList.length > 0) {
            let score = 0;
            let progressQuestionIds = progress.map(item => item.QuestionID);

            const calPercent = async (QuestionIds) => {
                try{
                    const response = await backend.post(`/question/checkQuestionType`, { QuestionIds });
                    if(response.status === 200){
                        let questionList = response.data.results;

                        const pretestQuestions = questionList.filter(item => item.Type === "Pre").map(item => item.QuestionID);                        
                        const labQuestions = questionList.filter(item => item.Type === "Lab").map(item => item.QuestionID);
                        const posttestQuestions = questionList.filter(item => item.Type === "Post").map(item => item.QuestionID);

                        
                        let preTestCompleted = pretestQuestions.some(questionID => {
                            const progressItem = progress.find(item => item.QuestionID === questionID);
                            return progressItem && progressItem.Status === "Done";
                        });
                        let postTestCompleted = posttestQuestions.some(questionID => {
                            const progressItem = progress.find(item => item.QuestionID === questionID);
                            return progressItem && progressItem.Status === "Done";
                        });
                        let labCompletedCount = labQuestions.filter(questionID => {
                            const progressItem = progress.find(item => item.QuestionID === questionID);
                            return progressItem && progressItem.Status === "Done";
                        }).length;

                        let preTestScore = preTestCompleted ? 1 : 0;
                        let labScore = labCompletedCount; 
                        let postTestScore = postTestCompleted ? 1 : 0;
                        
                        let totalScore = preTestScore + labScore + postTestScore;
                        let maxScore = 10; // Pre (1) + Lab (8) + Post (1)
                        let calculatedPercent = (totalScore / maxScore) * 100;

                    setPercent(calculatedPercent);
                        
                    }
                } catch (error) {
                    console.log(error);
                }
            }
            calPercent(progressQuestionIds);
            console.log(score)
        }
    }, [ progress, subjectList ]);
    
  return (
    <div className={style.container}>
        <label>{percent.toFixed(2)}%</label>
        <div className={style.process} style={{ width: `${percent.toFixed(2)}%` }}></div>
    </div>
  )
}

export default Processbar