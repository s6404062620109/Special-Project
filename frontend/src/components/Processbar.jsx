import React, { useEffect, useState } from 'react'
import axios from 'axios';

import style from './css/processbar.module.css';

/* Cal Percent */

 // pre / post test = 1;
 // maxlabscore = 8;
 // maxlavscore & pre&post = 10;

/* Cal Percent */

function Processbar({ courseId, histories }) {
    const [ percent, setPercent ] = useState(0);
    const [ subjectList, setSubjectList ] = useState([]);
    
    useEffect(() => {
        const fetchSubject = async () =>{
            try{
                const response = await axios.get(`http://localhost:3001/getAllSubject/${courseId}`);
                let subjectIds = response.data.subject.map(subject => subject.SubjectID);
                setSubjectList(subjectIds);
            } catch (error) {
                console.log(error);
            }
            
        }
        fetchSubject();
    }, [courseId]);
    
    useEffect(() => {
        if (Array.isArray(histories) && Array.isArray(subjectList) && subjectList.length > 0) {
            let score = 0;
            let historycheck = 0;
            const maxPretests = histories.filter(subject => subject.Type === "Pre");
            const maxPosttests = histories.filter(subject => subject.Type === "Post");
            // check Pre
            while(historycheck < histories.length){
                subjectList.map(subject => {
                    if (histories[historycheck]["Subject-ID"] === subject ) {
                        
                        if(histories[historycheck].Type === "Pre"){
                            score = score+(1/maxPretests.length);
                        }
                        if(histories[historycheck].Type === "Post"){
                            score = score+(1/maxPosttests.length);
                        }
                        
                        if(histories[historycheck].Type.toLowerCase().includes('lab')){
                            score++;
                        }
                    }
                });
                historycheck++;
            }

            const maxScore = subjectList.length + 2;
            const calculatedPercent = (score / maxScore) * 100;
            setPercent(calculatedPercent);
        }
    }, [ histories, subjectList ]);
    
  return (
    <div className={style.container}>
        <label>{percent.toFixed(2)}%</label>
        <div className={style.process} style={{ width: `${percent.toFixed(2)}%` }}></div>
    </div>
  )
}

export default Processbar