import { useEffect, useState, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../../context/AuthProvider';
import backend from '../../api/backend';

import style from './css/subject.module.css';
import NavSubject from './NavSubject';
import Reader from '../../components/Reader';
import Labs from './Labs';

import { Backdrop, Box, Button, IconButton, Slide, Stack } from '@mui/material';
import ListIcon from '@mui/icons-material/List';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { ArrowRight } from '@mui/icons-material';

const useLabQuestions = () => {
    const [ currentQuestionIndex, setCurrentQuestionIndex ] = useState(0);
    const [ questions, setQuestions ] = useState([]);
    const [ answers, setAnswers ] = useState([]);
    const [ errorMessage, setErrorMessage ] = useState("");
    const navigate = useNavigate();

    const handleChangePage = (event, page) => {
        setCurrentQuestionIndex(page-1);
        setErrorMessage("");
    };

    const fetchLabQuestions = async (courseId, subjectId) => {
        try{
            const response = await backend.get(`/labs/getLabQuestions/${courseId}/${subjectId}`,{
                withCredentials: true
            });
    
            if(response.status === 200){
                let questionResults = response.data.questionFormat
                setQuestions(questionResults);
            }
    
        } catch(error){ 
            console.log(error);
        }
    }

    const handleLabAnswerChange = (questionId, questionType, value, answerId = null, checked = null) => {
        
        setAnswers(prevAnswers => {
            return prevAnswers.map((item) => {
                if (item.questionId !== questionId) return item;

                let updatedAnswer = item.answer;

                if (questionType === 3) {
                    updatedAnswer = {
                        ...item.answer,
                        answerId, 
                        content: value
                    };
                }
                else if (questionType === 4 || questionType === 5) {
                    updatedAnswer = String(value);
                } 
                else if (questionType === 6) {
                    const prevArray = Array.isArray(item.answer) ? item.answer : [];
                    console.log(item)
                    if (checked) {
                        if (!prevArray.some(v => v.answerId === answerId)) {
                            updatedAnswer = [...prevArray, { answerId, content: value }];
                        } 
                        else {
                            updatedAnswer = prevArray;
                        }
                    } else {
                        updatedAnswer = prevArray.filter(v => v.answerId !== answerId);
                    }
                }

                return {
                    ...item,
                    answer: updatedAnswer
                };
            });
        });
    };

   const lasbValidations = (questionId) => {
        const answer = answers.find(a => a.questionId === questionId);
        const idx = questions.findIndex(q => q.id === questionId);

        setErrorMessage("");
        if (!answer) {
            setErrorMessage(`ไม่พบคำตอบของคำถามที่ ${idx + 1}`);
            return false;
        }

        let valid = true;

        if ((answer.lab_type === 3 || answer.lab_type === 4 || answer.lab_type === 5) 
            && (answer.answer === null || answer.answer === "")) {
            valid = false;
            setErrorMessage(`ต้องเลือกคำตอบสำหรับคำถามที่ ${idx + 1}.`);
        }

        if (answer.lab_type === 6 && (!Array.isArray(answer.answer) || answer.answer.length === 0)) {
            valid = false;
            setErrorMessage(`คำถามที่ ${idx + 1} ต้องการคำตอบอย่างน้อย 1 คำตอบ`);
        }

        return valid;
    };

    const handleLabSubmit = async (courseId, enrollmentId, questionId) => {
        if(!lasbValidations(questionId)){
           return; 
        }

        let answer = answers.find(a => a.questionId === questionId);
        try{
            const response = await backend.put(`/labs/submitLabQuestions/${courseId}/${enrollmentId}`, {
                answer
            }, {
                withCredentials: true
            });

            if(response.status === 200){
                setErrorMessage(response.data.message);
                setTimeout(() => {
                    setErrorMessage("");
                }, 3000);
            }
        } catch(error){
            console.log(error);
            setErrorMessage(error.response.data.message);
        }
    }

    return{
        currentQuestionIndex,
        handleChangePage,
        questions,
        setQuestions,
        answers,
        setAnswers,
        fetchLabQuestions,
        handleLabAnswerChange,
        errorMessage,
        handleLabSubmit,
    }
}

function Subject() {
    const { courseId, subjectId, enrollmentId } = useParams();
    const { userData } = useContext(AuthContext);
    const [ subjectList, setSubjectList ] = useState([]);
    const [ progressAnswers, setProgressAnswers ] = useState([]);
    const [ content, setContent ] = useState({
        name: "",
        content: null
    });
    const [ openNavSubject, setOpenNavSubject ] = useState(false);
    const [ labs, setLabs ] = useState(true);
    const {
        currentQuestionIndex,
        handleChangePage, 
        questions, 
        answers,
        setAnswers,
        fetchLabQuestions,
        handleLabAnswerChange,
        errorMessage,
        handleLabSubmit,
    } = useLabQuestions();
    const readerRef = useRef(null);
    const labsRef = useRef(null);
    const navigate = useNavigate();

    const fetchSubjectData = async () => {
        try {
            const response = await backend.get(`/subjects/getSubject/${courseId}/${subjectId}`, {
                withCredentials: true
            });

            if (response.status === 200) {
                const { subjectname, jsonData, pdfUrl } = response.data;
    
                setContent({
                    name: subjectname || "",
                    content: jsonData || pdfUrl || null,
                });
            }
        } catch (err) {
            console.log(err);
            if(err.response.status === 404 || err.response.data.message === "No courses found."){
                alert("โปรดลงทะเบียนเรียนใหม่ก่อนเข้าเรียน");
                window.location.href = "/";
            }
        }
    };

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

    const fetchLastProgress = async () => {
        try {
            const response = await backend.get(`/progress/getLatestProgress/${enrollmentId}/${courseId}`, {
                withCredentials: true
            });

            if (response.status === 200){
                if(response.data.inProgress === `pretest/${enrollmentId}`){
                    navigate(`/course/${courseId}/${response.data.inProgress}`);
                    return;
                }
                else if(response.data.inProgress === `posttest/${enrollmentId}`){
                    navigate(`/course/${courseId}/${response.data.inProgress}`);
                    return;
                }
                else{
                    console.log(response.data.inProgress)
                    navigate(`/course/${courseId}/${response.data.inProgress}`);
                    return;
                }
            }
        } 
        catch (error) {
            console.log(error);
        }
    }

    const questionIds = questions.map(q => q.id);

    const fetchAllProgressAnswers = async () => {
        if(!questionIds || questionIds.length === 0){
            return;
        }
        try {
            const response = await backend.get(`/progress/getAllProgressAnswers/${enrollmentId}/${courseId}?questionIds=${questionIds.join(",")}`, {
                withCredentials: true
            })
    
            if (response.status === 200) {
              setProgressAnswers(response.data.answers); 
            }
        } catch (error) {
            console.error(error);
        }
    }
    
    useEffect(() => {
        if (questionIds.length > 0) {
            fetchAllProgressAnswers();
        }
    }, [enrollmentId, courseId, JSON.stringify(questionIds)]);
    
    const handleLabSpawn = async (questionId) => {
        try {
            const response = await backend.post(`/labs/startLabSession/${courseId}`, {
                userId: userData.id,
                subjectId,
                questionId
            }, {
                withCredentials: true
            });

            if (response.status === 200) {
                const { terminalUrl } = response.data;
                const labWindow = window.open(terminalUrl, "_blank");

                const labCheckInterval = setInterval(() => {
                    if (labWindow.closed) {
                        clearInterval(labCheckInterval);
                        backend.post(`/labs/clearLabSession/${courseId}`, { userId: userData.id }, {
                            withCredentials: true
                        }).catch(err => console.error("cleanup error", err));
                    }
                }, 1000);
            }
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        fetchSubjectData();
        fetcSubjectList();
        fetchLabQuestions(courseId, subjectId);
    }, [courseId, subjectId]);

    useEffect(() => {
        if (questions.length > 0) {
            setAnswers(prevAnswers => {
                const updated = [...prevAnswers];

                questions.forEach(question => {
                    const exists = updated.find(item => item.questionId === question.id);
                    if (!exists) {
                        let defaultAnswer = null;

                        switch (question.type) {
                            case 6: 
                                defaultAnswer = []; 
                                break;
                            default: 
                                defaultAnswer = null;
                                break;
                        }

                        updated.push({
                            questionId: question.id,
                            answer: defaultAnswer,
                            lab_type: question.type
                        });
                    }
                });

                return updated;
            });
        }
    }, [questions]);

  return (
    <div className={style.container}>
        
        <Stack
            direction="row"
            alignItems="flex-start"
            justifyContent="space-between"
            sx={{ width: '100%', gap: 2 }}
        >
            <Box sx={{ flex: 1, minWidth: 0 }}>
                <div ref={readerRef}>
                    <Reader 
                        content={content} 
                        enrollmentId={enrollmentId}
                        subjectId={subjectId}
                    />
                </div>
            </Box>
            
            <Backdrop
                open={openNavSubject}
                sx={{ zIndex: 1300 }}
                onClick={() => setOpenNavSubject(false)}
            />

            {!openNavSubject && (
                <IconButton
                    onClick={() => setOpenNavSubject(true)}
                    sx={{
                        // display: { md: 'none', xs: 'flex' },
                        position: 'fixed',
                        bottom: "40%",
                        right: "5px",
                        transform: "translateY(-50%)",
                        zIndex: 1301,
                        background: 'white',
                        border: '1px solid #b3b3b3',
                        opacity: 0.5,
                        ':hover':{
                            opacity: 1
                        }
                    }}
                >
                    <ListIcon fontSize="large" />
                </IconButton>
            )}

            <Slide direction="left" in={openNavSubject} mountOnEnter unmountOnExit>
                <Stack
                    sx={{
                        // display: { md: 'none', xs: 'flex' },
                        position: 'fixed',
                        top: "35%",
                        right: "20px",
                        transform: "translateY(-50%)",
                        zIndex: 1301,
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <NavSubject
                        courseId={courseId}
                        subjectList={subjectList}
                        enrollmentId={enrollmentId}
                    />
                </Stack>
            </Slide>

            <Stack
                sx={{
                    position: 'fixed',
                    bottom: "20px",
                    left: "40px",
                    transform: "translateY(-50%)",
                    height: "100px",
                    justifyContent: "space-between",
                    zIndex: 1301,
                }}
            >
                <IconButton 
                    onClick={() => {
                        readerRef.current?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    sx={{
                        color: 'black',
                        opacity: 0.5,
                        ':hover':{
                            opacity: 1,
                            color: 'white',
                            background: '#1976d2',
                        }
                    }}
                >
                    <ExpandLessIcon/>
                </IconButton>

                <IconButton 
                    onClick={() => {
                        labsRef.current?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    sx={{
                        color: 'black',
                        opacity: 0.5,
                        ':hover':{
                            opacity: 1,
                            color: 'white',
                            background: '#1976d2',
                        }
                    }}
                >
                    <ExpandMoreIcon/>
                </IconButton>
            </Stack>
        </Stack>

        {labs && (
            <div ref={labsRef}>
                <Labs
                    currentQuestionIndex={currentQuestionIndex}
                    handleChangePage={handleChangePage}
                    questions={questions}
                    handleLabSpawn={handleLabSpawn}
                    answers={answers}
                    progressAnswers={progressAnswers}
                    handleLabAnswerChange={handleLabAnswerChange}
                    errorMessage={errorMessage}
                    handleLabSubmit={handleLabSubmit}
                    fetchLastProgress={fetchLastProgress}
                />
            </div>
        )}
        
    </div>
  )
}

export default Subject