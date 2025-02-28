import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom';
import backend from '../../api/backend';

import style from './css/subject.module.css';
import LabBox from '../../components/LabBox';
import NavSubject from '../../components/NavSubject';

function Subject() {
    const { courseId, subjectId } = useParams();
    const [ data, setData ] = useState({
        name: null,
        images: null,
    });
    const [ dataContent, setDataContent ] = useState({
        content: { title: '', description: '' },
        subcontent: [],
        summary: ''
    });
    const [ subjectList, setSubjectList ] = useState([]);
    const [ imgPath, setImgPath ] = useState('');
    const [ questionList, setQuestionList ] = useState([]);
    const [ useLab, setUseLab ] = useState(false);
    const [ navsubjectMobile, setNavsubjectMobile ] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    useEffect(() => {
        const fetchSubjectData = async () =>{
            try{
                const response = await backend.get(`/subjects/getSubject/${courseId}/${subjectId}`);

                if(response.status === 200){
                    let resultResponse = response.data.result[0];

                    setData({
                        name: resultResponse.name,
                        images: resultResponse.images ? resultResponse.images.split(",").map(img => img.trim()) : [],
                    });

                    let jsonResponse = response.data.jsonData;
                    setDataContent(jsonResponse);
                }
                    
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
        const fetchImages = async () => {
            try {
                if (data.images.length > 0) {
                    const imageRequests = data.images.map(async (img) => {
                        const response = await backend.get(`/imgrender/getContentImage/${courseId}/${subjectId}/${img}`);
                        return response.data.url ? `${import.meta.env.VITE_API_BASE_URL}${response.data.url}` : null;
                    });
    
                    const imagePaths = await Promise.all(imageRequests);
                    setImgPath(imagePaths.filter(path => path !== null));
                }
            } catch (err) {
                console.log("Error fetching images:", err);
            }
        };
        fetchImages();
    }, [courseId, subjectId, data.images]);
    

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
    
    const prevImage = () => {
        setCurrentImageIndex(prevIndex => (prevIndex === 0 ? imgPath.length - 1 : prevIndex - 1));
    };

    const nextImage = () => {
        setCurrentImageIndex(prevIndex => (prevIndex === imgPath.length - 1 ? 0 : prevIndex + 1));
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
                        <h2>{dataContent.content.title}</h2>
                        <p>{formatContent(dataContent.content.description)}</p>

                        <div className={style.subcontent}>
                            {dataContent.subcontent.map((sub, index) => (
                                <div key={index} className={style["subcontent-item"]}>
                                    <h3>{sub.title}</h3>
                                    <p>{formatContent(sub.description)}</p>
                                </div>
                            ))}
                        </div>

                        <div className={style.summary}>
                            <h3>สรุป</h3>
                            <p>{formatContent(dataContent.summary)}</p>
                        </div>
                    </div>

                    {imgPath.length > 0 && (
                        <div className={style.Picture}>
                            <button className={style.prevBtn} onClick={prevImage}>&#10094;</button>
                            <img alt="Content" src={imgPath[currentImageIndex]} className={style["content-image"]} />
                            <div>{data.images[currentImageIndex]}</div>
                            <button className={style.nextBtn} onClick={nextImage}>&#10095;</button>
                        </div>
                    )}
                </div>

                <div className={style.questionBox}>
                    { useLab && questionList.map((item, ind) => (
                        <LabBox
                            no={ind+1}
                            id={item.id}
                            question={item.content}
                            type={item.type}
                            courseId={courseId}
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