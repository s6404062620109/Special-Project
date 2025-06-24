import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom';
import backend from '../../api/backend';

import style from './css/subject.module.css';
import LabBox from '../../components/LabBox';
import NavSubject from './NavSubject';
import Reader from '../../components/Reader';

import { Backdrop, Box, IconButton, Slide, Stack } from '@mui/material';
import ListIcon from '@mui/icons-material/List';

function Subject() {
    const { courseId, subjectId, enrollmentId } = useParams();
    const [ subjectList, setSubjectList ] = useState([]);
    const [ content, setContent ] = useState({
        name: "",
        content: null
    });
    const [ navSubjectMobile, setNavSubjectMobile ] = useState(false);

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

    useEffect(() => {
        fetchSubjectData();
        fetcSubjectList();
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
                <Reader 
                    content={content} 
                    enrollmentId={enrollmentId}
                    subjectId={subjectId}
                />
            </Box>

            <Box className={style["navsubject-wrap"]}>
                <NavSubject 
                    courseId={courseId}
                    subjectList={subjectList}
                    enrollmentId={enrollmentId}
                />
            </Box>
            
            <Backdrop
                open={navSubjectMobile}
                sx={{ zIndex: 1300 }}
                onClick={() => setNavSubjectMobile(false)}
            />

            {!navSubjectMobile && (
                <IconButton
                    onClick={() => setNavSubjectMobile(true)}
                    sx={{
                        display: { md: 'none', xs: 'flex' },
                        position: 'fixed',
                        top: "50%",
                        right: "20px",
                        transform: "translateY(-50%)",
                        zIndex: 1301,
                    }}
                >
                    <ListIcon fontSize="large" />
                </IconButton>
            )}

            <Slide direction="left" in={navSubjectMobile} mountOnEnter unmountOnExit>
                <Stack
                    sx={{
                        display: { md: 'none', xs: 'flex' },
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

    </div>
  )
}

export default Subject