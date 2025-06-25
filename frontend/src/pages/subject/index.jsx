import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom';
import backend from '../../api/backend';

import style from './css/subject.module.css';
import NavSubject from './NavSubject';
import Reader from '../../components/Reader';

import { Backdrop, Box, Button, IconButton, Slide, Stack } from '@mui/material';
import ListIcon from '@mui/icons-material/List';

function Subject() {
    const { courseId, subjectId, enrollmentId } = useParams();
    const [ subjectList, setSubjectList ] = useState([]);
    const [ content, setContent ] = useState({
        name: "",
        content: null
    });
    const [ navSubjectMobile, setNavSubjectMobile ] = useState(false);
    const [ labs, setLabs ] = useState(true);
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
    }, [courseId, subjectId]);

    const handleLabsClick = () => {
        let lab_url = `${window.location.origin}/labs/${courseId}/${subjectId}/${enrollmentId}`
        window.open(lab_url, "_blank");
    }
    
  return (
    <div className={style.container}>
        
        <Stack
            direction="row"
            alignItems="flex-start"
            justifyContent="space-between"
            sx={{ width: '100%', gap: 2 }}
        >
            <Box sx={{ flex: 1, minWidth: 0 }}>
                <Reader 
                    content={content} 
                    enrollmentId={enrollmentId}
                    subjectId={subjectId}
                />
            </Box>

            {/* <Box className={style["navsubject-wrap"]}>
                <NavSubject 
                    courseId={courseId}
                    subjectList={subjectList}
                    enrollmentId={enrollmentId}
                />
            </Box> */}
            
            <Backdrop
                open={navSubjectMobile}
                sx={{ zIndex: 1300 }}
                onClick={() => setNavSubjectMobile(false)}
            />

            {!navSubjectMobile && (
                <IconButton
                    onClick={() => setNavSubjectMobile(true)}
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

            <Slide direction="left" in={navSubjectMobile} mountOnEnter unmountOnExit>
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
                    setNavSubjectMobile={setNavSubjectMobile}
                    />
                </Stack>
            </Slide>
        </Stack>

        {labs && (
            <Stack
                direction='row'
                justifyContent='center'
                alignItems='center'
                sx={{
                    margin: '20px'
                }}
            >
                <Button
                    variant="contained"
                    onClick={handleLabsClick}
                >
                    Labs
                </Button>
            </Stack>
        )}
        
    </div>
  )
}

export default Subject