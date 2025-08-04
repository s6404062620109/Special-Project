import React, { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom';
import backend from '../../../api/backend';

import style from "./css/subject.module.css";
import EditManual from './editContents/EditManual';

import AddIcon from '@mui/icons-material/Add';
import ArrowLeftIcon from '@mui/icons-material/ArrowLeft';
import DeleteIcon from '@mui/icons-material/Delete';
import DescriptionIcon from '@mui/icons-material/Description';
import { Alert, Box, Button, Dialog, DialogContent, DialogTitle, IconButton, Slide, Snackbar, Stack, Typography } from '@mui/material';

import EditQuestion from './editContents/EditQuestion';
import Preview from './Preview';
import Reader from '../../../components/Reader';
import AddPdf, { VisuallyHiddenInput } from './addContents/AddPdf';

function SlideTransition(props) {
  return <Slide {...props} direction="left" />;
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/* Input Format Functions */

const useSubjectForm = () => {
    const [ subjectInput, setSubjectInput ] = useState({ name: "", content: [] });
    const [ subjectData, setSubjectData ] = useState({ name: "", content: [] });

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

        for (const file of files) {
        if (!file.type.startsWith("image/")) {
            return "Only image files are allowed.";
        }

        if (file.size > 6 * 1024 * 1024) {
            return "File size must be less than 6MB";
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            updatedContent[index].imgs.push(reader.result);
            setSubjectInput({ ...subjectInput, content: updatedContent });
        };
        reader.readAsDataURL(file);
        }

        return null;
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

        if (!isNameChanged && !isContentChanged) {
            return "Subject input is not changed!";
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
/* Input Pdf Functions */

const usePdfForm = () => {
    const [ subjectPdfInput, setSubjectPdfInput ] = useState({
        name: "",
        file: null,
    });
    const [ subjectPdfData, setSubjectPdfData ] = useState({ name: "", file: null });
    const inputRef = useRef(null);

    const handleBoxClick = () => {
        inputRef.current.click();
    };

    const handleFileChange = (event) => {
        const selectedFile = event.target.files[0];

        if (!selectedFile) return null;

        if (selectedFile.type !== "application/pdf") {
            return "Only PDF files are allowed.";
        }

        if (selectedFile.size > 16 * 1024 * 1024) {
            return "File size must be less than 16MB.";
        }

        setSubjectPdfInput(prev => ({ ...prev, file: selectedFile }));
        return null;
    };

    const pdfValidation = () => {
        const { name, file } = subjectPdfInput;

        if (!name) {
            return "Subject Name is required.";
        }

        if (file) {
            if (file.type !== "application/pdf") {
                return "Please select a PDF file.";
            }

            if (file.size > 16 * 1024 * 1024) {
                return "File size must be less than 16MB.";
            }
        }

        return null;
    };

    return{
        subjectPdfInput,
        setSubjectPdfInput,
        subjectPdfData,
        setSubjectPdfData,
        inputRef,
        handleBoxClick,
        handleFileChange,
        pdfValidation
    }
}

/* Input Pdf Functions */
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/* Input Question Functions */

const useQuestionForm = (setAlertMessage, setOpenSnackbar) => {
    const [ questionType, setQuestionType ] = useState([]);
    const [ questionInput, setQuestionInput ] = useState([]);
    const [ questionData, setQuestionData ] = useState([]);
    const [ questionDelete, setQuestionDelete ] = useState([]);
    const [ choiceDelete, setChoiceDelete ] = useState([]);
    const [ filePathDelete, setFilePathDelete ] = useState([]);
    const [ openImgUpload, setOpenImgUpload ] = useState(false);
    const [ openLabsUpload, setOpenLabsUpload ] = useState(null);
    const [ selectedImageIndex, setSelectedImageIndex ] = useState(null);
    const [ selectedLabIndex, setSelectedLabIndex ] = useState(-1);
    const questionImgInputRef = useRef(null);

    const handleQuestionTypeChange = (index, type) => {
        setQuestionInput(prevQuestions => {
            return prevQuestions.map((question, qIndex) => {
                if (qIndex !== index) return question;

                if (type === 4) {
                    return {
                        type: type,
                        content: question.content || '',
                        img: question.img || '',
                        answer: '',
                        Cmdfile: null,
                    };
                }
                else if (type === 5) {
                    return {
                        type: type,
                        content: question.content || '',
                        img: question.img || '',
                        answer: '',
                        htmlFile: null,
                    };
                } 
                else {
                    return {
                        type: type,
                        content: question.content || '',
                        img: question.img || '',
                        choice: [{ content: '', isCorrect: false }],
                    };
                }
            });
        });
    };

    const handleQuestionChange = (index, field, value) => {
        if (field === "type") {
            return;
        }

        setQuestionInput(prevQuestions => {
            const question = prevQuestions[index];
            if (!question || question[field] === value) return prevQuestions;

            const updatedQuestion = { ...question, [field]: value };
            const newQuestions = [...prevQuestions];
            newQuestions[index] = updatedQuestion;
            return newQuestions;
        });
    };

    const handleOpenLabUpload = (index, action) => {
        setSelectedLabIndex(index);
        setOpenLabsUpload(action);
    };
    const handleCloseLabUpload = () => {
        setOpenLabsUpload(null);
        setSelectedLabIndex(-1);
    };

    const handleLabfileUpload = (index, event, action) => {
        const files = Array.from(event.target.files);
        const updatedQuestions = [...questionInput];

        if(action === "Cmd"){
            if (!files[0].name.endsWith(".sh")) {
                setAlertMessage(`Question ${index + 1}: Only .sh files are allowed for Cmdfile.`);
                setOpenSnackbar(true);
                return;
            }

            updatedQuestions[index].Cmdfile = files[0];
        }
        else if(action === "Web"){
            if (!files[0].name.endsWith(".html")) {
                setAlertMessage(`Question ${index + 1}: Only .html files are allowed for htmlFile.`);
                setOpenSnackbar(true);
                return;
            }

            updatedQuestions[index].htmlFile = files[0];
        }

        setQuestionInput(updatedQuestions);
        handleCloseLabUpload(action);
    };
    const handleLabFileDelete = (index, fileIndex, att) => {
        const updatedQuestions = [...questionInput];
        const cmdPath = updatedQuestions[index].Cmdfile?.path;
        const htmlPath = updatedQuestions[index].htmlFile?.path;

        if(att === "Cmd"){
            if (cmdPath) {
                setFilePathDelete(prev => [...prev, cmdPath]);
            }
            updatedQuestions[index].Cmdfile = null;
        }
        else if(att === "Web"){
            if (htmlPath) {
                setFilePathDelete(prev => [...prev, htmlPath]);
            }
            updatedQuestions[index].htmlFile = null;
        }

        setQuestionInput(updatedQuestions);
    };

    const handleOpenImgDialog = (index) => {
        setSelectedImageIndex(index);
        setOpenImgUpload(true);
    };
    const handleCloseImgUpload = () => {
        setSelectedImageIndex(null);
        setOpenImgUpload(false);
    };
    
    const handleImageQuestionUpload = (index, event) => {
        const files = Array.from(event.target.files);
        const updatedQuestions = [...questionInput];

        if(files.length === 0){
            updatedQuestions[index].img = null;
            setQuestionInput(updatedQuestions);
            handleCloseImgUpload();
            return;
        }

        for (const file of files) {
        if (!file.type.startsWith("image/")) {
            return "Only image files are allowed.";
        }

        if (file.size > 6 * 1024 * 1024) { 
            return "File size must be less than 6MB";
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            updatedQuestions[index].img = reader.result;
            setQuestionInput(updatedQuestions);
        };
        reader.readAsDataURL(file);
        }
        handleCloseImgUpload();
    }
        
    const handleChoiceChange = (questionIndex, choiceIndex, field, value) => {
        setQuestionInput(prevQuestions => {
            const newQuestions = prevQuestions.map((question, qIndex) => {
                if (qIndex !== questionIndex) return question;

                const updatedChoices = question.choice.map((choice, cIndex) => {
                    if (cIndex !== choiceIndex) return choice;
                    return { ...choice, [field]: value };
                });

                return { ...question, choice: updatedChoices };
            });

            return newQuestions;
        });
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
            img: null,
            type: questionType[0].id,
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
        const targetId = questionInput[questionIndex].choice[choiceIndex]?.id;
        const newQuestions = [...questionInput];
        newQuestions[questionIndex].choice.splice(choiceIndex, 1);
        setQuestionInput(newQuestions);

        if (targetId) {
            setChoiceDelete(prev => [...prev, targetId]);
        }
    };
    
    const deleteQuestion = (index) => {
        const targetId = questionInput[index]?.id;
        const newQuestions = questionInput.filter((_, i) => i !== index);
        setQuestionInput(newQuestions);
        if (targetId) {
            setQuestionDelete(prev => [...prev, targetId]);
        }
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

            if (item.type === 1 || item.type === 2 || item.type === 3 || item.type === 6){
                if (item.choice.length === 0) {
                return `At least one choice is required for Question ${i + 1}`;
                }
                for (let j = 0; j < item.choice.length; j++) {
                    const choice = item.choice[j];
                    if (choice.content === "") {
                        return `Choice ${j + 1} content for Question ${i + 1} is required`;
                    }
                }

                const correctChoices = item.choice.filter(choice => choice.isCorrect);
                if(item.type === 6 && correctChoices.length === 1){
                    return `Question ${i + 1} of type "${item.type}" must have than one more correct choice`
                }
                if (correctChoices.length === 0) {
                    return `Question ${i + 1} of type "${item.type}" must have least one correct choice`;
                }

                const incorrectChoices = item.choice.filter(choice => !choice.isCorrect);
                if (incorrectChoices.length === 0) {
                    return `Question ${i + 1} of type "${item.type}" must have at least one incorrect choice`;
                }
            }

            if (item.type === 5) {
                if (item.htmlFile === null) {
                    return `Question ${i + 1}: htmlFile is required.`;
                }
                if (item.htmlFile) {
                    if (!item.htmlFile.name.endsWith(".html")) {
                        return `Question ${i + 1}: htmlFile must be a .html file.`;
                    }
                }

                if(item.answer === ""){
                    return `Question ${i + 1}: Answer is required`;
                }
            }

            if (item.type === 4) {

                if (item.Cmdfile === null) {
                    return `Question ${i + 1}: Cmdfile is required.`;
                }

                if (item.Cmdfile) {
                    if (!item.Cmdfile.name.endsWith(".sh")) {
                        return `Question ${i + 1}: Cmdfile must be a .sh file.`;
                    }
                }

                if(item.answer === ""){
                    return `Question ${i + 1}: Answer is required`;
                }
            }
        }

        return;
    }

    return{
        questionType,
        setQuestionType,
        questionDelete,
        choiceDelete,
        questionInput,
        openImgUpload,
        selectedImageIndex,
        questionImgInputRef,
        openLabsUpload,
        selectedLabIndex,
        filePathDelete,
        handleOpenLabUpload,
        handleCloseLabUpload,
        handleLabfileUpload,
        handleLabFileDelete,
        handleOpenImgDialog,
        handleCloseImgUpload,
        handleImageQuestionUpload,
        setQuestionInput,
        setQuestionData,
        handleQuestionChange,
        handleQuestionTypeChange,
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
    const [ alertMessage, setAlertMessage ] = useState("");
    const [ alertOpen, setAlertOpen ] = useState(false);
    const [ manualPreview, setManualPreview ] = useState(false);
    const [ pdfPreview, setPdfPreview ] = useState(false);
    const [ questionPreview, setQuestionPreview ] = useState(false);
    const editMode = localStorage.getItem("editMode");

    const {
        setSubjectData,  
        subjectInput, 
        setSubjectInput,
        addContent,
        removeContent,
        handleChange,
        handleImageUpload,
        removeImage,
        subjectValidation 
    } = useSubjectForm();
    const {
        questionType,
        setQuestionType,
        questionDelete,
        choiceDelete,
        questionInput,
        openImgUpload,
        selectedImageIndex,
        questionImgInputRef,
        openLabsUpload,
        selectedLabIndex,
        filePathDelete,
        handleOpenLabUpload,
        handleCloseLabUpload,
        handleLabfileUpload,
        handleLabFileDelete,
        handleOpenImgDialog,
        handleCloseImgUpload,
        handleImageQuestionUpload,
        setQuestionInput,
        setQuestionData,
        handleQuestionChange,
        handleQuestionTypeChange,
        handleChoiceChange,
        addQuestion,
        addChoice,
        deleteChoice,
        deleteQuestion,
        questionValidation
    } = useQuestionForm( setAlertMessage, setAlertOpen );
    const { 
        subjectPdfInput,
        setSubjectPdfInput,
        subjectPdfData,
        setSubjectPdfData,
        inputRef,
        handleBoxClick,
        handleFileChange,
        pdfValidation 
    } = usePdfForm();

    const fetchSubjectPdf = async (name, path) => {
        try {
            const response = await backend.get(path, { withCredentials: true, responseType: 'blob' });

            if (response.status === 200) {
                const pdfFile = new File([response.data], `${name}.pdf`, { type: 'application/pdf' });
                setSubjectPdfData({ name: subjectPdfInput.name, file: pdfFile });
            }
        } catch (error) {
            console.log(error);
        }
    }
  
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
                        // console.log('PDF URL:', subjectData.pdfUrl);
                        setSubjectPdfInput({ ...subjectPdfInput, name: subjectData.subjectname });
                        fetchSubjectPdf(subjectData.subjectname, `${import.meta.env.VITE_API_BASE_URL}/subjects${subjectData.pdfUrl}`);
                        localStorage.setItem("editMode", "pdf");
                        setMode("pdf");
                    }
                    if (Array.isArray(subjectData.question) && subjectData.question.length > 0) {
                        setQuestionData(subjectData.question);
                        setQuestionInput(JSON.parse(JSON.stringify(subjectData.question)));
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

    const fetchQuestionType = async () => {
        try {
            const response = await backend.get("/teacher/getQuestionType", { withCredentials: true });
            if(response.status === 200){
                setQuestionType(response.data.result);
            }
        } catch (error) {
            console.log(error);
        }
    }

    useEffect(() => {
        fetchSubjectData();
        fetchQuestionType();
    }, [courseId, subjectId]);

    const onUploadImage = (index, event) => {
        const error = handleImageUpload(index, event);
        if (error) {
            setAlertMessage(error);
            setAlertOpen(true);
        }
    };

    const onUploadPdf = (event) => {
        const error = handleFileChange(event);
        if (error) {
            setAlertMessage(error);
            setAlertOpen(true);
        }
    };

    const submitUpdate = async () => {
        const formData = new FormData();

        formData.append('name', editMode === "manual" ? subjectInput.name : subjectPdfInput.name);

        if(editMode === "manual"){
            formData.append('content', JSON.stringify(subjectInput.content));
        } else if(editMode === "pdf"){
            formData.append('file', subjectPdfInput.file);
        }

        const updatedQuestions = questionInput.map((question, qIndex) => {
            const newQuestion = { ...question };

            if (question.type === 4 && question.Cmdfile instanceof File) {
                const cmdField = `q${qIndex}_cmd`;
                formData.append(cmdField, question.Cmdfile);
                newQuestion.Cmdfile = cmdField; 
            }

            if (question.type === 5 && question.htmlFile instanceof File) {
                const htmlField = question.htmlFile.name;
                formData.append(htmlField, question.htmlFile);
                newQuestion.Htmlfile = htmlField; 
            }

            return newQuestion;
        });

        formData.append('question', JSON.stringify(updatedQuestions));

        if (questionDelete.length > 0) {
            formData.append('questionDelete', JSON.stringify(questionDelete));
        }
        if (choiceDelete.length > 0) {
            formData.append('choiceDelete', JSON.stringify(choiceDelete));
        }

        if (filePathDelete.length > 0) {
            formData.append('filePathDelete', JSON.stringify(filePathDelete));
        }
        const url = editMode === "manual"
                ? `/teacher/updateSubject/${courseId}/${subjectId}`
                : `/teacher/updatePdfSubject/${courseId}/${subjectId}`
        try {
            const response = await backend.put(url, formData,
                {
                    headers: { 'Content-Type': 'multipart/form-data' },
                    withCredentials: true
                }
            );

            if (response.status === 200) {
                setAlertMessage(response.data.message);
                setAlertOpen(true);
                setTimeout(() => {
                    navigate(`/edit-course/${courseId}`);
                }, 3000);
            }
        } catch (error) {
            console.log(error);
        }
    };

    const handleSubmit = () => {
        if(mode === "manual"){
            setMode("question");
            return;
        }
        else if(mode === "pdf"){
            setMode("question");
            return;
        }
        else if(mode === "question"){
            let subjectValication = subjectValidation();
            let pdfValication = pdfValidation();
            let questionValication = questionValidation();

            if(editMode === "manual"){
                if(subjectValication || questionValication){
                    const error = subjectValication || questionValication;
                    setAlertMessage(error);
                    setAlertOpen(true);
                    return;
                }
                ocalStorage.setItem("selector-question-type", true);
                setMode("submit");
                return;
            }
            else if(editMode === "pdf"){
                if(pdfValication || questionValication){
                    const error = pdfValication || questionValication;
                    setAlertMessage(error);
                    setAlertOpen(true);
                    return;
                }
                localStorage.setItem("selector-question-type", true); 
                setMode("submit");
                return;
            }
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
        else if(mode === "pdf"){
            setPdfPreview(true);
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
                    handleImageUpload={onUploadImage}
                    removeImage={removeImage}
                    handleSubmit={handleSubmit}
                    handlePreview={handlePreview}
                />
            )}

            {( mode === "pdf" ) && (
                <AddPdf
                    subjectPdfInput={subjectPdfInput}
                    setSubjectPdfInput={setSubjectPdfInput}
                    inputRef={inputRef}
                    handleBoxClick={handleBoxClick}
                    handleFileChange={onUploadPdf}
                    handleSubmit={handleSubmit}
                    handlePreview={handlePreview}
                />
            )}

            {( mode === "question" && 
            questionInput.length > 0) && (
                <EditQuestion
                    questionInput={questionInput}
                    questionType={questionType}
                    handleOpenLabUpload={handleOpenLabUpload}
                    handleOpenImgDialog={handleOpenImgDialog}
                    handleQuestionChange={handleQuestionChange}
                    handleQuestionTypeChange={handleQuestionTypeChange}
                    handleChoiceChange={handleChoiceChange}
                    addQuestion={addQuestion}
                    addChoice={addChoice}
                    deleteChoice={deleteChoice}
                    deleteQuestion={deleteQuestion}
                    handleSubmit={handleSubmit}
                    handlePreview={handlePreview}
                />
            )}

            {( mode === "manual" && manualPreview ) && (
                <Preview
                    subjectInput={subjectInput}
                    questionInput={null}
                    PreviewPopupOpen={manualPreview}
                    setPreviewPopupOpen={setManualPreview}
                />
            )}

            {( mode === "pdf" && pdfPreview ) && (
                <Preview
                    subjectInput={ subjectPdfInput.name !== "" && subjectPdfInput.file ? subjectPdfInput : subjectPdfData }
                    questionInput={null}
                    PreviewPopupOpen={pdfPreview}
                    setPreviewPopupOpen={setPdfPreview}
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
            ((editMode === "manual" && subjectInput.name !== "" && subjectInput.content.length !== 0) || 
            (editMode === "pdf" )) && (questionInput.length !== 0)) && (
                <Stack
                    sx={{
                        margin: "20px auto",
                    }}
                >
                    <Typography variant='h5' fontWeight='600'>ตัวอย่างเนื้อหาที่ปรับปรุงของบทเรียน { editMode === "manual" ? subjectInput.name : subjectPdfInput.name }</Typography>

                    <Reader 
                        content={subjectInput.name !== "" && subjectInput.content.length !== 0 ? subjectInput : subjectPdfInput}
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
                            onClick={() => {
                                localStorage.removeItem('editMode');
                                localStorage.removeItem('prevMode');
                                localStorage.removeItem('selector-question-type');

                                navigate(`/edit-course/${courseId}`);
                            }}
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

            {(selectedLabIndex !== -1 && openLabsUpload === "cmd") && (
                <Dialog open={openLabsUpload === "cmd"} onClose={() => handleCloseLabUpload()}>
                    <DialogTitle>Lab {selectedLabIndex + 1} Shell File</DialogTitle>
                    <DialogContent>
                        <Box>
                            <Stack 
                            justifyContent="center" 
                            alignItems="center"
                            >
                            {questionInput[selectedLabIndex]?.Cmdfile && (
                                <Stack
                                    direction="row"
                                    justifyContent="center"
                                    alignItems="center"
                                    gap={1}
                                >
                                    <DescriptionIcon/>
                                    <Typography variant='body2'>{questionInput[selectedLabIndex].Cmdfile.name}</Typography>

                                    <IconButton
                                        onClick={() => handleLabFileDelete(selectedLabIndex, 0, "Cmd")}
                                    >
                                    <DeleteIcon/>
                                    </IconButton>
                                </Stack>
                            )}

                            <VisuallyHiddenInput
                                type="file"
                                id={`cmd-upload-${selectedLabIndex}`}
                                multiple
                                onChange={(e) => handleLabfileUpload(selectedLabIndex, e, "Cmd")}
                            />

                            <label htmlFor={`cmd-upload-${selectedLabIndex}`}>
                                <Button variant="contained" component="span">File Upload</Button>
                            </label>
                            
                            </Stack>
                        </Box>
                    </DialogContent>
                </Dialog>
            )}

            {(selectedLabIndex !== -1 && openLabsUpload === "web") && (
                <Dialog open={openLabsUpload === "web"} onClose={() => handleCloseLabUpload()}>
                    <DialogTitle>Lab {selectedLabIndex + 1} HTML File</DialogTitle>
                    <DialogContent>
                        <Box>
                            <Stack 
                            justifyContent="center" 
                            alignItems="center"
                            >
                            {questionInput[selectedLabIndex]?.htmlFile && (
                                <Stack
                                    direction="row"
                                    justifyContent="center"
                                    alignItems="center"
                                    gap={1}
                                >
                                    <DescriptionIcon/>
                                    <Typography variant='body2'>{questionInput[selectedLabIndex].htmlFile.name}</Typography>

                                    <IconButton
                                        onClick={() => handleLabFileDelete(selectedLabIndex, 0, "Web")}
                                    >
                                    <DeleteIcon/>
                                    </IconButton>
                                </Stack>
                            )}

                            <VisuallyHiddenInput
                                type="file"
                                id={`cmd-upload-${selectedLabIndex}`}
                                multiple
                                onChange={(e) => handleLabfileUpload(selectedLabIndex, e, "Web")}
                            />

                            <label htmlFor={`cmd-upload-${selectedLabIndex}`}>
                                <Button variant="contained" component="span">File Upload</Button>
                            </label>
                            
                            </Stack>
                        </Box>
                    </DialogContent>
                </Dialog>
            )}

            <Dialog open={openImgUpload} onClose={handleCloseImgUpload}>
                <DialogTitle>Question Image Upload</DialogTitle>
                <DialogContent>
                    <Box
                        onClick={() => questionImgInputRef.current?.click()}
                        sx={{
                        width: '400px',
                        height: '200px', 
                        border: '1px dashed #b3b3b3',
                        borderRadius: '8px',
                        position: 'relative',
                        '&:hover': {
                            borderColor: '#888',
                            background: '#f0f0f0',
                            cursor: 'pointer'
                        }
                        }}
                    >
                        <Stack
                        direction="column"
                        justifyContent="center"
                        alignItems="center"
                        sx={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                        }}
                        >
                        {questionInput[selectedImageIndex]?.img ? (
                            <Typography variant="body1" sx={{ color: '#666', mt: 1 }}>
                            Image selected ✔
                            </Typography>
                        ) : (
                            <Stack justifyContent="center" alignItems="center">
                            <AddIcon sx={{ color: '#b3b3b3' }} />
                            <Typography variant="h6" sx={{ color: '#b3b3b3' }}>
                                Upload Image here.
                            </Typography>
                            </Stack>
                        )}
                        </Stack>

                        <VisuallyHiddenInput
                            ref={questionImgInputRef}
                            type="file"
                            onChange={(e) => handleImageQuestionUpload(selectedImageIndex, e)}
                            accept="image/*"
                        />
                    </Box>

                    <Stack
                        direction="row"
                        justifyContent="flex-end"
                        sx={{
                            marginTop: "16px"
                        }}
                    >
                        <Button
                            variant="contained"
                            component="label"
                            color="error"
                            startIcon={<DeleteIcon />}
                            onClick={() => handleImageQuestionUpload(selectedImageIndex, { target: { files: [] } })}
                        >
                            Clear
                        </Button>
                    </Stack>
                </DialogContent>
            </Dialog>
        </div>
    </div>
  )
}

export default EditSubject