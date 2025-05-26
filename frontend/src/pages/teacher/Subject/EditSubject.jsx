import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom';
import backend from '../../../api/backend';

import style from "./css/subject.module.css";
import EditManual from './editContents/EditManual';

import ArrowLeftIcon from '@mui/icons-material/ArrowLeft';
import { Button } from '@mui/material';

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/* Input Format Functions */

const useSubjectForm = () => {
    const [ subjectInput, setSubjectInput ] = useState({ name: "", content: [] });

    const addContent = () => {
        setSubjectInput(prev => ({
        ...prev,
        content: [...prev.content, { topic: "", description: "", imgs: [] }]
        }));
    };

    const removeContent = (index) => {
        const updatedContent = subjectInput.content.filter((_, i) => i !== index);
        setSubjectInput({ ...subjectInput, content: updatedContent });
    };

    return {
        subjectInput,
        setSubjectInput,
        addContent,
        removeContent
    };
};

/* Input Format Functions */
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/* Input Question Functions */

const useQuestionForm = () => {
    const [ questionType ] = useState([ "Pre", "Post", "Lab", "Quiz" ]);
    const [ questionInput, setQuestionInput ] = useState([]);

    return{
        questionType,
        questionInput,
        setQuestionInput
    }
}

/* Input Question Functions */
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


function EditSubject() {
    const { courseId, subjectId } = useParams();
    const navigate = useNavigate();
    const {  
        subjectInput, 
        setSubjectInput,
        addContent,
        removeContent 
    } = useSubjectForm();
    const {
        questionType,
        questionInput,
        setQuestionInput
    } = useQuestionForm();


    const fetchSubjectData = async () => {
        try {
            const response = await backend.get(`/teacher/getSubject/${courseId}/${subjectId}`, { withCredentials: true });
            
            if(response.status === 200){
                const subjectData = response.data;

                console.log(subjectData)
                if(subjectData.subjectname){

                    if (Array.isArray(subjectData.jsonData) && subjectData.jsonData.length > 0) {
                        setSubjectInput({ name: subjectData.subjectname, content: subjectData.jsonData });
                    }
                    if (typeof subjectData.pdfUrl === 'string' && subjectData.pdfUrl.trim() !== '') {
                        console.log('PDF URL:', subjectData.pdfUrl)
                    }
                    if (Array.isArray(subjectData.question) && subjectData.question.length > 0) {
                        setQuestionInput(subjectData.question);
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

            {(subjectInput.subjectName !== "" && subjectInput.content.length > 0) ? (
                <EditManual
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