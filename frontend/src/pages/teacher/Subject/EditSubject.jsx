import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom';
import backend from '../../../api/backend';

import style from "./css/subject.module.css";
import EditManual from './editContents/editManual';

import ArrowLeftIcon from '@mui/icons-material/ArrowLeft';
import { Button } from '@mui/material';

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/* Input Format Functions */

const useSubjectForm = () => {
    const [ subjectData, setSubjectData ] = useState({
        jsonData: [],
        question: [],
        pdfUrl: "",
        subjectName: ""
    });
    const [ subjectInput, setSubjectInput ] = useState({
        jsonData: [],
        question: [],
        pdfUrl: "",
        subjectName: ""
    });

    useEffect(() => {
        setSubjectInput(subjectData);
    }, [subjectData]);

    const addContent = () => {
        setSubjectInput(prev => ({
        ...prev,
        jsonData: [...prev.jsonData, { topic: "", description: "", imgs: [] }]
        }));
    };

    const removeContent = (index) => {
        setSubjectInput(prev => ({
        ...prev,
        jsonData: prev.jsonData.filter((_, i) => i !== index)
        }));
    };

    return {
        subjectData,
        setSubjectData,
        subjectInput,
        setSubjectInput,
        addContent,
        removeContent
    };
};

/* Input Format Functions */
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function EditSubject() {
    const { courseId, subjectId } = useParams();
    const navigate = useNavigate();
    const { 
        subjectData, 
        setSubjectData, 
        subjectInput, 
        setSubjectInput,
        addContent,
        removeContent 
    } = useSubjectForm();

    const fetchSubjectData = async () => {
        try {
            const response = await backend.get(`/teacher/getSubject/${courseId}/${subjectId}`, { withCredentials: true });
            
            if(response.status === 200){
                const subjectData = response.data;
                
                if(subjectData.subjectname && subjectData.question.length > 0){
                    setSubjectData({ ...subjectData, subjectName: subjectData.subjectname, question: subjectData.question });

                    if (Array.isArray(subjectData.jsonData) && subjectData.jsonData.length > 0) {
                        setSubjectData({ ...subjectData, jsonData: subjectData.jsonData });
                    }
                    if (typeof subjectData.pdfUrl === 'string' && subjectData.pdfUrl.trim() !== '') {
                        setSubjectData({ ...subjectData, pdfUrl: subjectData.pdfUrl });
                    }
                    else {
                        console.warn("Missing subjectName in response");
                        return;
                    }
                }
            }
        } catch (error) {
            console.log(error);
        }
    }

    useEffect(() => {
        fetchSubjectData();
    }, [courseId, subjectId]);
    console.log(subjectInput)
  return (
    <div className={style.pageWrapper}>
        <div className={style.container}>
            <Button 
                variant="contained" 
                startIcon={<ArrowLeftIcon />}
                onClick={() => navigate(-1)}
            >
                Back
            </Button>

            {(subjectData.subjectName !== "" && subjectData.jsonData.length > 0) ? (
                <EditManual
                    subjectData={subjectData}
                    setSubjectData={setSubjectData}
                    subjectInput={subjectInput}
                    setSubjectInput={setSubjectInput}
                    addContent={addContent}
                    removeContent={removeContent}
                />
            ) : (
                <></>
            )}
        </div>
    </div>
  )
}

export default EditSubject