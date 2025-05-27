import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom';
import backend from '../../../api/backend';

import style from "./css/subject.module.css";
import EditManual from './editContents/EditManual';

import ArrowLeftIcon from '@mui/icons-material/ArrowLeft';
import { Button } from '@mui/material';
import EditQuestion from './editContents/EditQuestion';
import Preview from './Preview';

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/* Input Format Functions */

const useSubjectForm = () => {
    const [ subjectInput, setSubjectInput ] = useState({ name: "", content: [] });
    const [ subjectData, setSubjectData ] = useState({ name: "", content: [] });

    useEffect(() => {
        setSubjectData(subjectInput);
    }, [subjectInput]);

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

    const handleChange = (index, field, value) => {
        const updatedContent = [...subjectInput.content];
        updatedContent[index][field] = value;
        setSubjectInput({ ...subjectInput, content: updatedContent });
    };

    const handleImageUpload = (index, event) => {
        const files = Array.from(event.target.files);
        const updatedContent = [...subjectInput.content];

        files.forEach(file => {
            if (!file.type.startsWith("image/")) {
                alert("Only image files are allowed.");
                return;
            }

            if (file.size <= 6 * 1024 * 1024) {
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onloadend = () => {
                    updatedContent[index].imgs.push(reader.result);
                    setSubjectInput({ ...subjectInput, content: updatedContent });
                };
            } else {
                alert("File size must be less than 6MB");
            }
        });
    };

    const removeImage = (contentIndex, imgIndex) => {
        const updatedContent = [...subjectInput.content];
        updatedContent[contentIndex].imgs = updatedContent[contentIndex].imgs.filter((_, i) => i !== imgIndex);
        setSubjectInput({ ...subjectInput, content: updatedContent });
    };

    return {
        subjectInput,
        setSubjectInput,
        addContent,
        removeContent,
        handleChange,
        handleImageUpload,
        removeImage
    };
};

/* Input Format Functions */
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/* Input Question Functions */

const useQuestionForm = () => {
    const [ questionType ] = useState([ "Pre", "Post", "Lab", "Quiz" ]);
    const [ questionInput, setQuestionInput ] = useState([]);

    const handleQuestionChange = (index, field, value) => {
        const newQuestions = [...questionInput];
        newQuestions[index][field] = value;
        setQuestionInput(newQuestions);
    };
    
    const handleChoiceChange = (questionIndex, choiceIndex, field, value) => {
        const newQuestions = [...questionInput];
        newQuestions[questionIndex].choice[choiceIndex][field] = value;
        setQuestionInput(newQuestions);
    };

    const addQuestion = () => {
        const newQuestion = {
        content: "",
        choice: [
            {
            content: "",
            isCorrect: false,
            },
        ],
        img: "",
        type: questionType[0],
        };
        setQuestionInput([...questionInput, newQuestion]);
    };
    
    const addChoice = (index) => {
        const newQuestions = [...questionInput];
        newQuestions[index].choice.push({
        content: "",
        isCorrect: false,
        });
        setQuestionInput(newQuestions);
    };
    
    const deleteChoice = (questionIndex, choiceIndex) => {
        const newQuestions = [...questionInput];
        newQuestions[questionIndex].choice.splice(choiceIndex, 1);
        setQuestionInput(newQuestions);
    };
    
    const deleteQuestion = (index) => {
        const newQuestions = questionInput.filter((_, i) => i !== index);
        setQuestionInput(newQuestions);
    };

    return{
        questionType,
        questionInput,
        setQuestionInput,
        handleQuestionChange,
        handleChoiceChange,
        addQuestion,
        addChoice,
        deleteChoice,
        deleteQuestion
    }
}

/* Input Question Functions */
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


function EditSubject() {
    const { courseId, subjectId } = useParams();
    const navigate = useNavigate();
    const [ mode, setMode ] = useState("");
    const [ manualPreview, setManualPreview ] = useState(false);
    const [ questionPreview, setQuestionPreview ] = useState(false);
    const {  
        subjectInput, 
        setSubjectInput,
        addContent,
        removeContent,
        handleChange,
        handleImageUpload,
        removeImage 
    } = useSubjectForm();
    const {
        questionType,
        questionInput,
        setQuestionInput,
        handleQuestionChange,
        handleChoiceChange,
        addQuestion,
        addChoice,
        deleteChoice,
        deleteQuestion
    } = useQuestionForm();

    const fetchSubjectData = async () => {
        try {
            const response = await backend.get(`/teacher/getSubject/${courseId}/${subjectId}`, { withCredentials: true });
            
            if(response.status === 200){
                const subjectData = response.data;

                if(subjectData.subjectname){

                    if (Array.isArray(subjectData.jsonData) && subjectData.jsonData.length > 0) {
                        setSubjectInput({ name: subjectData.subjectname, content: subjectData.jsonData });
                        localStorage.setItem("editMode", "manual");
                        setMode("manual");
                    }
                    if (typeof subjectData.pdfUrl === 'string' && subjectData.pdfUrl.trim() !== '') {
                        console.log('PDF URL:', subjectData.pdfUrl);
                        localStorage.setItem("editMode", "pdf");
                        setMode("pdf");
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

    const handleSubmit = () => {
        if(mode === "manual" || mode === "pdf"){
            setMode("question");
            return;
        }
        else if(mode === "question"){
            setMode("submit");
            return;
        }
    }

    const handleBack = () => {
        if(mode === "submit"){
            setMode("question");
            return;
        }
        else if(mode === "question"){
            if(localStorage.getItem("editMode") === "manual"){
                setMode("manual");
                return;
            }
            else if(localStorage.getItem("editMode") === "pdf"){
                setMode("pdf");
                return;
            }
        }
    }

    const handlePreview = () => {
        if(mode === "manual"){
            setManualPreview(true);
            return;
        }
        else if(mode === "question"){
            setQuestionPreview(true);
            return;
        }
    }

  return (
    <div className={style.pageWrapper}>
        <div className={style.container}>
            <Button 
                variant="contained" 
                startIcon={<ArrowLeftIcon />}
                onClick={handleBack}
            >
                Back
            </Button>

            {( mode === "manual" && 
            subjectInput.subjectName !== "" && 
            subjectInput.content.length > 0) && (
                <EditManual
                    subjectInput={subjectInput}
                    setSubjectInput={setSubjectInput}
                    addContent={addContent}
                    removeContent={removeContent}
                    handleChange={handleChange}
                    handleImageUpload={handleImageUpload}
                    removeImage={removeImage}
                    handleSubmit={handleSubmit}
                    handlePreview={handlePreview}
                />
            )}

            {( mode === "question" && 
            questionInput.length > 0) && (
                <EditQuestion
                    questionInput={questionInput}
                    questionType={questionType}
                    handleQuestionChange={handleQuestionChange}
                    handleChoiceChange={handleChoiceChange}
                    addQuestion={addQuestion}
                    addChoice={addChoice}
                    deleteChoice={deleteChoice}
                    deleteQuestion={deleteQuestion}
                    handleSubmit={handleSubmit}
                    handlePreview={handlePreview}
                />
            )}

            {( mode === "manual" && manualPreview) && (
                <Preview
                    subjectInput={subjectInput}
                    questionInput={null}
                    PreviewPopupOpen={manualPreview}
                    setPreviewPopupOpen={setManualPreview}
                />
            )}

            {( mode === "question" && questionPreview) && (
                <Preview
                    subjectInput={null}
                    questionInput={questionInput}
                    PreviewPopupOpen={questionPreview}
                    setPreviewPopupOpen={setQuestionPreview}
                />
            )}
        </div>
    </div>
  )
}

export default EditSubject