import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom';

import style from './css/subject.module.css';
import LabBox from '../../components/LabBox';
import NavSubject from '../../components/NavSubject';
import backend from '../../api/backend';


function Subject() {
    const { courseId, subjectId } = useParams();
    const [ data, setData ] = useState({
        id: null,
        name: null,
        content: null,
        images: null,
        courseId: null
    });
    const [ subjectList, setSubjectList ] = useState([]);
    const [ imgPath, setImgPath ] = useState('');
    const [ questionList, setQuestionList ] = useState([]);
    const [ useLab, setUseLab ] = useState(false);
    const [ navsubjectMobile, setNavsubjectMobile ] = useState(false);

    useEffect(() => {
        const fetchSubjectData = async () =>{
            try{
                const response = await backend.get(`/subjects/getSubject/${courseId}/${subjectId}`);

                let dataResponse = response.data[0];
                
                setData({
                    id: dataResponse.id,
                    name: dataResponse.name,
                    content: dataResponse.content,
                    images: dataResponse.images,
                    courseId: dataResponse.courseId
                });    
            }
            catch(err){
                console.log(err)
            }
        }

        fetchSubjectData();
        
        const fetcSubjectList = async () => { 
            try{
                const response = await backend.get(`/subjects/getAllSubject/${courseId}`);

                if(response.status === 200){
                    setSubjectList(response.data.subject);
                }
            } catch(error){
                console.log(error);
            }
        }
        fetcSubjectList();
    }, [courseId, subjectId]);

    useEffect(() => {
        const fetchImage = async () => {
            try {
                const response = await backend.get(`/imgrender/getContentImage/${courseId}/${subjectId}/${data.images}`);
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
                    setQuestionList(response.data.questionResult);
                }

            } catch(error){
                console.log(error);
            }
        }

        fetchQuestion();
        if(questionList.length > 0){
            setUseLab(true);
        }
    }, [subjectId]);
    
    useEffect(() => {
        setUseLab(questionList.length > 0);
    },[questionList]);

    const formatContent = (content) => {
        if (!content) return null;
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
                            <NavSubject 
                                courseId={courseId}
                                subjectList={subjectList}
                            />
                        </div>
                    }  

                    <div className={style.Info}>
                        <h1>{data.name}</h1>

                        <div className={style["lecture-wrap"]}>
                            <label>{formatContent(data.content)}</label>
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
                            id={item.id}
                            question={item.content}
                        />
                    ))}
                </div>
            </div>
            
            <div className={style["navsubject-wrap"]}>
                <NavSubject 
                    courseId={courseId}
                    subjectList={subjectList}
                />
            </div>
        </div>

    </div>
  )
}

export default Subject