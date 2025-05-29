import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom';
import backend from '../../api/backend';

import style from './css/subject.module.css';
import LabBox from '../../components/LabBox';
import NavSubject from './NavSubject';
import Reader from '../../components/Reader';
import { Box, Stack } from '@mui/material';

function Subject() {
    const { courseId, subjectId, enrollmentId } = useParams();
    const [ subjectList, setSubjectList ] = useState([]);
    const [ content, setContent ] = useState({
        name: "",
        content: null
    });

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
        </Stack>

    </div>
  )
}

export default Subject