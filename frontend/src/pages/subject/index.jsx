import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom';
import axios from 'axios';

import style from './css/subject.module.css';
import LabBox from '../../components/LabBox';


function Subject() {
    const { courseId, subjectId } = useParams();
    const [ data, setData ] = useState({
        SubjectID: '',
        Name: '',
        Content: '',
        Image_id: '',
        CourseID: ''
    });

    useEffect(() => {
        const fetchData = async () =>{
            try{
                const response = await axios.get(`http://localhost:3001/getSubject/${courseId}/${subjectId}`);

                let dataResponse = response.data[0];
                setData({
                    SubjectID: dataResponse.SubjectID,
                    Name: dataResponse.Name,
                    Content: dataResponse.Content,
                    Image_id: dataResponse.Image_id,
                    CourseID: dataResponse["Course-ID"]
                });    
            }
            catch(err){
                console.log(err)
            }   
        }
        fetchData();
    }, [courseId, subjectId])

  return (
    <div className={style.container}>
        <div className={style.content}>
            <div className={style.Info}>
                <h1>{data.Name}</h1>
                <label>{data.Content}</label>
            </div>
            <div className={style.Picture}>
                <img
                    alt='Content Picture'
                    src={`/Course_Assets/${data.Image_id}.png`}
                />
            </div>
        </div>

        <div className={style.questionBox}>
            <LabBox/>
        </div>
    </div>
  )
}

export default Subject