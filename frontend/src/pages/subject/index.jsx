import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom';

import style from './css/subject.module.css';
import LabBox from '../../components/LabBox';
import NavSubject from '../../components/NavSubject';
import backend from '../../api/backend';


function Subject() {
    const { courseId, subjectId } = useParams();
    const [ data, setData ] = useState({
        SubjectID: '',
        Name: '',
        Content: '',
        Image_id: '',
        CourseID: ''
    });
    const [ imgPath, setImgPath ] = useState('');
    const [ questionList, setQuestionList ] = useState([]);
    const [ useLab, setUseLab ] = useState(true);
    const [ navsubjectMobile, setNavsubjectMobile ] = useState(false);

    useEffect(() => {
        const fetchData = async () =>{
            try{
                const response = await backend.get(`/subjects/getSubject/${courseId}/${subjectId}`);

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

            try {
                const labresponse = await backend.get(`/lab/getLabquestion/${subjectId}`);
              } catch (err) {
                if (err.response && err.response.status === 500) {
                  setUseLab(false);
                }
                console.log('Error fetching lab data:', err);
              }   
        }
        fetchData();
    }, [courseId, subjectId]);

    useEffect(() => {
        const fetchImage = async () => {
            try {
                const response = await backend.get(`/imgrender/getContentImage/${courseId}/${subjectId}/${data.Image_id}`);
                if (response.status === 200) {
                    setImgPath(`${import.meta.env.VITE_API_BASE_URL}${response.data.url}`);
                }
            } catch (err) {
                console.log("Error fetching icon:", err);
            }
        };
        fetchImage();
    }, [ courseId, subjectId, data]);

    useEffect(() => {
        const fetchQuestion = async () => {
            try{
                const response = await backend.get(`/lab/getLabquestion/${subjectId}`);

                if(response.status === 200){
                    setQuestionList(response.data.questionResult)
                }

            } catch(error){
                console.log(error);
            }
        }

        fetchQuestion();
    }, [subjectId]);

    const formatContent = (content) => {
        return content.split("\n").map((str, index) => (
            <React.Fragment key={index}>
                {str}
                <br />
            </React.Fragment>
        ));
    };

  return (
    <div className={style.container}>
        
        <div className={style["container-wrap"]}>

            <div className={style["content-wrap"]}>
                <div className={style.content}>
                    <div 
                        className={style["burger-icon"]}
                        onClick={() => setNavsubjectMobile(!navsubjectMobile)}
                    >
                        <img
                            alt='burger Icon'
                            src={navsubjectMobile ? '/Navbar_Assets/Close_round_light.svg' : '/Navbar_Assets/burger.svg'}
                        /> 
                    </div>
                    {navsubjectMobile && 
                        <div className={style["navsubjectm-wrap"]}>
                            <NavSubject courseId={courseId}/>
                        </div>
                    }  

                    <div className={style.Info}>
                        <h1>{data.Name}</h1>

                        <div className={style["lecture-wrap"]}>
                            <label>{formatContent(data.Content)}</label>
                        </div>
                    </div>

                    <div className={style.Picture}>
                        <img
                            alt='Content Picture'
                            src={imgPath}
                        />
                    </div>
                </div>

                <div className={style.questionBox}>
                    { useLab && questionList.map((item, ind) => (
                        <LabBox
                            no={ind+1}
                            id={item.QuestionID}
                            question={item.Question}
                        />
                    ))}
                </div>
            </div>
            
            <div className={style["navsubject-wrap"]}>
                <NavSubject courseId={courseId}/>
            </div>
        </div>

    </div>
  )
}

export default Subject