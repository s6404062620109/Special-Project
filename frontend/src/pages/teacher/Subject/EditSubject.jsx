import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom';
import backend from '../../../api/backend';

import style from "./css/subject.module.css";
import EditManual from './editContents/EditManual';

import ArrowLeftIcon from '@mui/icons-material/ArrowLeft';
import { Alert, Button, Slide, Snackbar, Stack } from '@mui/material';
import EditQuestion from './editContents/EditQuestion';
import Preview from './Preview';
import Reader from '../../../components/Reader';

function SlideTransition(props) {
  return <Slide {...props} direction="left" />;
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/* Input Format Functions */

const useSubjectForm = () => {
    const [ subjectInput, setSubjectInput ] = useState({ name: "", content: [] });
    const [ subjectData, setSubjectData ] = useState({ name: "", content: [] });
    const [ alertMessage, setAlertMessage ] = useState("");
    const [ alertOpen, setAlertOpen ] = useState(false);

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
                setAlertMessage("Only image files are allowed.");
                setAlertOpen(true);
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

    const subjectValidation = () => {

        const isNameChanged = subjectInput.name !== subjectData.name;

        const isContentChanged =
            subjectInput.content.length !== subjectData.content.length ||
            subjectInput.content.some((item, i) => {
                const original = subjectData.content[i];
                if (!original) return true;
                const isImgsChanged = JSON.stringify(item.imgs) !== JSON.stringify(original.imgs);
                return (
                    item.topic !== original.topic ||
                    item.description !== original.description ||
                    isImgsChanged
                );
            });

        console.log(isNameChanged, isContentChanged)
        if (!isNameChanged && !isContentChanged) {
            return "Please make some changes before submitting";
        }

        if (subjectInput.name === "") return "Subject Name is required";
        if (subjectInput.content.length === 0) return "At least one content is required";

        for (let i = 0; i < subjectInput.content.length; i++) {
            const item = subjectInput.content[i];
            if (item.topic === "") return `Topic ${i + 1} is required`;
            if (item.description === "") return `Description for Topic ${i + 1} is required`;
        }

        return null;
    };

    return {
        setSubjectData,
        subjectInput,
        setSubjectInput,
        alertMessage,
        setAlertMessage,
        alertOpen,
        setAlertOpen,
        addContent,
        removeContent,
        handleChange,
        handleImageUpload,
        removeImage,
        subjectValidation
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

    const questionValidation = () => {
        if(questionInput.length === 0) {
            return "At least one question is required";
        }
        for (let i = 0; i < questionInput.length; i++) {
            const item = questionInput[i];
            if (item.content === "") {
                return `Question ${i + 1} content is required`;
            }
            if (item.choice.length === 0) {
                return `At least one choice is required for Question ${i + 1}`;
            }
            for (let j = 0; j < item.choice.length; j++) {
                const choice = item.choice[j];
                if (choice.content === "") {
                return `Choice ${j + 1} content for Question ${i + 1} is required`;
                }
            }

            if (item.type === "Pre" || item.type === "Post") {
                const correctChoices = item.choice.filter(choice => choice.isCorrect);
                if (correctChoices.length === 0) {
                return `Question ${i + 1} of type "${item.type}" must have least one correct choice`;
                }
                const incorrectChoices = item.choice.filter(choice => !choice.isCorrect);
                if (incorrectChoices.length === 0) {
                return `Question ${i + 1} of type "${item.type}" must have at least one incorrect choice`;
                }
            }
        }

        return;
    }

    return{
        questionType,
        questionInput,
        setQuestionInput,
        handleQuestionChange,
        handleChoiceChange,
        addQuestion,
        addChoice,
        deleteChoice,
        deleteQuestion,
        questionValidation
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
    const editMode = localStorage.getItem("editMode");

    const {
        setSubjectData,  
        subjectInput, 
        setSubjectInput,
        alertMessage,
        setAlertMessage,
        alertOpen,
        setAlertOpen,
        addContent,
        removeContent,
        handleChange,
        handleImageUpload,
        removeImage,
        subjectValidation 
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
        deleteQuestion,
        questionValidation
    } = useQuestionForm();

    const fetchSubjectData = async () => {
        try {
            const response = await backend.get(`/teacher/getSubject/${courseId}/${subjectId}`, { withCredentials: true });
            
            if(response.status === 200){
                const subjectData = response.data;

                if(subjectData.subjectname){

                    if (Array.isArray(subjectData.jsonData) && subjectData.jsonData.length > 0) {
                        setSubjectData({ name: subjectData.subjectname, content: subjectData.jsonData });

                        setSubjectInput({ 
                            name: subjectData.subjectname, 
                            content: JSON.parse(JSON.stringify(subjectData.jsonData)) 
                        });
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

    const submitUpdate = async () => {
        const formData = new FormData();

        if(editMode === "manual"){
            formData.append('name', subjectInput.name);
            formData.append('content', JSON.stringify(subjectInput.content));
            formData.append('question', JSON.stringify(questionInput));
        }

        // else if (editMode === "pdf") {
        //     formData.append('name', subjectPdfInput.name);
        //     formData.append('file', subjectPdfInput.file);
        //     formData.append('question', JSON.stringify(questionInput));
        // }
        try {
            const response = await backend.put(`/teacher/updateSubject/${courseId}/${subjectId}`, 
                formData,
                {
                    headers: { 'Content-Type': 'multipart/form-data' },
                    withCredentials: true
                }
            );

            if(response.status === 200){
                console.log(response.data);
                setAlertMessage(response.data.message);
                setAlertOpen(true);

                setTimeout(() => {
                    navigate(`/edit-course/${courseId}`);
                }, 3000);
            }
        } catch (error) {
            console.log(error);
        }
    }

    const handleSubmit = () => {
        let validationError;
        if(mode === "manual"){
            validationError = subjectValidation();
            if (validationError) {
                setAlertMessage(validationError);
                setAlertOpen(true);
                return;
            }
            setMode("question");
            return;
        }
        else if(mode === "pdf"){
            setMode("question");
            return;
        }
        else if(mode === "question"){
            validationError = questionValidation();
            if(validationError){
                setAlertMessage(validationError);
                setAlertOpen(true);
                return;
            }
            setMode("submit");
            return;
        }
        else if(mode === "submit"){
            submitUpdate();
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
        else{
            navigate(-1);
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

            <Snackbar
                open={alertOpen}
                autoHideDuration={5000}
                onClose={() => setAlertOpen(false)}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                slots={{ transition: SlideTransition }} 
            >
                <Alert 
                    onClose={() => setAlertOpen(false)} 
                    severity={
                        (alertMessage === "Subject updated successfully.")
                        ? "success" : "error"
                    }
                    variant="filled" 
                    sx={{ width: '100%' }}
                >
                    {alertMessage}
                </Alert>
            </Snackbar>

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

            {( (mode === "submit") && 
            ((editMode === "manual" && subjectInput.name !== "" && subjectInput.content.length !== 0)) && 
            (questionInput.length !== 0)) && (
                <Stack>
                    <Reader 
                        content={subjectInput.name !== "" && subjectInput.content.length !== 0 ? subjectInput : ""}
                        question={questionInput}
                        subjectId={subjectId}
                        mode={mode}
                    />

                    <Stack
                        sx={{
                            width: { xs: "60%", sm: "40%" },
                            margin: "20px auto",
                            gap: 2,
                            flexDirection: { xs: "column", sm: "row" },
                        }}
                    >
                        <Button 
                            variant='outlined' 
                            sx={{
                            background: "red",
                            color: "white",
                            width: { xs: '100%', sm: '50%' }
                            }}
                            onClick={() => navigate(`/edit-course/${courseId}`)}
                        >
                            Cancel
                        </Button>

                        <Button 
                            variant='contained'
                            sx={{
                            background: "green",
                            width: { xs: '100%', sm: '50%' }
                            }}
                            onClick={handleSubmit}
                        >
                            Confirm
                        </Button>
                            
                    </Stack>
                </Stack>
            )}
        </div>
    </div>
  )
}

export default EditSubject