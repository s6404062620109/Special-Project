import { useEffect, useState, useRef } from 'react'
import { useParams } from 'react-router-dom';
import backend from '../../api/backend';

import style from './css/subject.module.css';
import NavSubject from './NavSubject';
import Reader from '../../components/Reader';
import Labs from '../labs';

import { Backdrop, Box, IconButton, Slide, Stack } from '@mui/material';
import ListIcon from '@mui/icons-material/List';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const useLabQuestions = () => {
    const [ questions, setQuestions ] = useState([]);

    const fetchLabQuestions = async (courseId) => {
        try{
            const response = await backend.get(`/labs/getLabQuestions/${courseId}`,{
                withCredentials: true
            });
    
            if(response.status === 200){
                setQuestions(response.data.questionFormat);
            }
    
        } catch(error){ 
            console.log(error);
        }
    }
    
    return{
        questions,
        setQuestions,
        fetchLabQuestions,
    }
}

function Subject() {
    const { courseId, subjectId, enrollmentId } = useParams();
    const [ subjectList, setSubjectList ] = useState([]);
    const [ content, setContent ] = useState({
        name: "",
        content: null
    });
    const [ openNavSubject, setOpenNavSubject ] = useState(false);
    const [ labs, setLabs ] = useState(true);
    const { questions, setQuestions, fetchLabQuestions } = useLabQuestions();
    const readerRef = useRef(null);
    const labsRef = useRef(null);

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

            if (response.status === 200) {
                console.log(response.data.ininProgress)
               if(response.data.inProgress !== `subject/${subjectId}/${enrollmentId}`){
                    setLabs(false);
               }
               else{
                    setLabs(true);
               }
            }
        } catch (err) {
            console.log(err);
        }
    }

    useEffect(() => {
        fetchSubjectData();
        fetcSubjectList();
        fetchLastProgress();
        fetchLabQuestions(courseId);
    }, [courseId, subjectId]);
    
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

            {/* <Box className={style["navsubject-wrap"]}>
                <NavSubject 
                    courseId={courseId}
                    subjectList={subjectList}
                    enrollmentId={enrollmentId}
                />
            </Box> */}
            
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
                    zIndex: 1301,
                }}
            >
                <IconButton 
                    onClick={() => {
                        readerRef.current?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    sx={{
                        opacity: 0.5,
                        ':hover':{
                            opacity: 1,
                            background: '#1976d2',
                            color: 'white'
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
                        opacity: 0.5,
                        ':hover':{
                            opacity: 1,
                            background: '#1976d2',
                            color: 'white'
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
                    questions={questions}
                />
            </div>
        )}
        
    </div>
  )
}

export default Subject