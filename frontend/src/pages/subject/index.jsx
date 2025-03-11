import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom';
import backend from '../../api/backend';

import style from './css/subject.module.css';
import LabBox from '../../components/LabBox';
import NavSubject from './NavSubject';

function Subject() {
    const { courseId, subjectId, enrollmentId } = useParams();
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
    const [ currentImageIndex, setCurrentImageIndex ] = useState(0);
    const [ isLabCompleted, setIsLabCompleted ] = useState(false);
    const navigate = useNavigate();

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
        if (questionList.length === 0) return;

        const fetchProgressData = async () => {
            try {
                const response = await backend.get(`/progress/checkCourseProgress/${enrollmentId}`);
                
                if (response.status === 200) {
                    const progressData = response.data.results;

                    const pretestProgress = progressData.filter(item => item.type === 'pre');
                    const allPretestsCompleted = pretestProgress.every(item => item.is_completed === 1);
                    if (!allPretestsCompleted) {
                        alert('You must complete all Pretest questions before proceeding.');
                        navigate(`/course/${courseId}/pretest/${enrollmentId}`);
                        return;
                    }

                    const allLabsCompleted = questionList.every(q => 
                        progressData.some(p => p.questionId === q.id && p.is_completed === 1)
                    );
                    setIsLabCompleted(allLabsCompleted);
                }
            } catch (error) {
                console.log(error);
                if (error.response?.status === 500) {
                    alert("You are not enrolled in this course.");
                    window.location.href = '/courses';
                }
            }
        };
    
        fetchProgressData();
    }, [enrollmentId, questionList, courseId, navigate]);

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
        setUseLab(questionList.length > 0);
    },[questionList]);

    const formatContent = (content) => {
        if (!content) return null;

        const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([\w\-]{11})/gi;

        return content.split("\n").map((str, index) => {

            const youtubeMatch = str.match(youtubeRegex);
            if (youtubeMatch) {

                const videoId = youtubeMatch[0].includes("youtu.be")
                    ? youtubeMatch[0].split("/")[3]
                    : youtubeMatch[0].split("v=")[1].split("&")[0];

                return (
                    <React.Fragment key={index}>
                        <div className={style["video-wrapper"]}>
                            <iframe
                                width="560"
                                height="315"
                                src={`https://www.youtube.com/embed/${videoId}`}
                                title="YouTube video"
                                frameBorder="0"
                                allowFullScreen
                            />
                        </div>
                    </React.Fragment>
                );
            }

            const imageMatch = data.images.find(img => str.includes(img));
            if (imageMatch) {
                const imageIndex = data.images.indexOf(imageMatch);
                return (
                    <React.Fragment key={index}>
                        <img
                            src={imgPath[imageIndex]}
                            alt={imageMatch}
                            className={style.Picture}
                        />
                        <br />
                    </React.Fragment>
                );
            }

            return (
                <React.Fragment key={index}>
                    {str}
                    <br />
                </React.Fragment>
            );
        });
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
                                enrollmentId={enrollmentId}
                            />
                        </div>
                    }  

                    <div className={style.Info}>
                        <h1>{data.name}</h1>

                        {/* {imgPath.length > 0 && (
                            <div className={style.Picture}>
                                {imgPath.length > 1 &&(
                                    <button className={style.prevBtn} onClick={prevImage}>&#10094;</button>
                                )}
                                
                                <img alt="Content" src={imgPath[currentImageIndex]} className={style["content-image"]} />
                                <div>{data.images[currentImageIndex]}</div>

                                {imgPath.length > 1 && (
                                    <button className={style.nextBtn} onClick={nextImage}>&#10095;</button>
                                )}
                                
                            </div>
                        )} */}

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

                    
                </div>
                
                {!isLabCompleted && (
                    <div className={style.questionBox}>
                        <h2>Lab Question</h2>
                        { useLab && questionList.map((item, ind) => (
                            <LabBox
                                key={ind}
                                no={ind+1}
                                id={item.id}
                                question={item.content}
                                type={item.type}
                                courseId={courseId}
                                enrollmentId={enrollmentId}
                            />
                        ))}
                    </div>
                )}
                
            </div>
            
            <div className={style["navsubject-wrap"]}>
                <NavSubject 
                    courseId={courseId}
                    subjectList={subjectList}
                    enrollmentId={enrollmentId}
                />
            </div>
        </div>

    </div>
  )
}

export default Subject