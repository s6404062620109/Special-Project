import React, { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom';
import backend from '../../../api/backend';

import style from "./css/subject.module.css";
import EditManual from './editContents/EditManual';

import AddIcon from '@mui/icons-material/Add';
import ArrowLeftIcon from '@mui/icons-material/ArrowLeft';
import { Alert, Box, Button, Dialog, DialogContent, DialogTitle, Slide, Snackbar, Stack, Typography } from '@mui/material';
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
        
        const isSameName = name === subjectPdfData.name;

        if (isSameName && !file) {
            return "No changes made to the PDF or Question input.";
        }

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

const useQuestionForm = () => {
    const [ questionType, setQuestionType ] = useState([]);
    const [ questionInput, setQuestionInput ] = useState([]);
    const [ questionData, setQuestionData ] = useState([]);
    const [ questionDelete, setQuestionDelete ] = useState([]);
    const [ choiceDelete, setChoiceDelete ] = useState([]);
    const [ openImgUpload, setOpenImgUpload ] = useState(false);
    const [ selectedImageIndex, setSelectedImageIndex ] = useState(null);
    const questionImgInputRef = useRef(null);

    const handleQuestionChange = (index, field, value) => {
        const newQuestions = [...questionInput];
        newQuestions[index][field] = value;
        setQuestionInput(newQuestions);
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
    
    const isQuestionChanged = (original, input) => {
        if (original.length !== input.length) return true;

        for (let i = 0; i < original.length; i++) {
            const q1 = original[i];
            const q2 = input[i];

            if (q1.content !== q2.content || q1.type !== q2.type) {
                return true;
            }

            if (q1.choice.length !== q2.choice.length) return true;

            for (let j = 0; j < q1.choice.length; j++) {
                const c1 = q1.choice[j];
                const c2 = q2.choice[j];

                if (
                    c1.id !== c2.id ||
                    c1.content !== c2.content ||
                    c1.isCorrect !== c2.isCorrect
                ) {
                    return true;
                }
            }
        }

        return false;
    };

    const questionValidation = () => {

        if(questionInput.length === 0) {
            return "At least one question is required";
        }

        if (!isQuestionChanged(questionData, questionInput)) {
            return "Question input is not changed!";
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
        setQuestionType,
        questionDelete,
        choiceDelete,
        questionInput,
        openImgUpload,
        selectedImageIndex,
        questionImgInputRef,
        handleOpenImgDialog,
        handleCloseImgUpload,
        handleImageQuestionUpload,
        setQuestionInput,
        setQuestionData,
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
        handleOpenImgDialog,
        handleCloseImgUpload,
        handleImageQuestionUpload,
        setQuestionInput,
        setQuestionData,
        handleQuestionChange,
        handleChoiceChange,
        addQuestion,
        addChoice,
        deleteChoice,
        deleteQuestion,
        questionValidation
    } = useQuestionForm();
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

        if(editMode === "manual"){
            formData.append('name', subjectInput.name);
            formData.append('content', JSON.stringify(subjectInput.content));
            formData.append('question', JSON.stringify(questionInput));
            if(questionDelete.length > 0){
                formData.append('questionDelete', JSON.stringify(questionDelete));
            }
            if(choiceDelete.length > 0){
                formData.append('choiceDelete', JSON.stringify(choiceDelete));
            }

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

        else if (editMode === "pdf") {
            formData.append('name', subjectPdfInput.name);
            formData.append('file', subjectPdfInput.file);
            formData.append('question', JSON.stringify(questionInput));
            if(questionDelete.length > 0){
                formData.append('questionDelete', JSON.stringify(questionDelete));
            }
            if(choiceDelete.length > 0){
                formData.append('choiceDelete', JSON.stringify(choiceDelete));
            }

            try {
                const response = await backend.put(`/teacher/updatePdfSubject/${courseId}/${subjectId}`, 
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
        
    }

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
                if(!subjectValication || !questionValication ){
                    setMode("submit");
                    return;
                }
                
                const error = subjectValication || questionValication;
                setAlertMessage(error);
                setAlertOpen(true);
                return;
            }
            else if(editMode === "pdf"){
                if(!pdfValication || !questionValication ){
                    setMode("submit");
                    return;
                }
                
                const error = pdfValication || questionValication;
                setAlertMessage(error);
                setAlertOpen(true);
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
                    handleOpenImgDialog={handleOpenImgDialog}
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
                </DialogContent>
            </Dialog>
        </div>
    </div>
  )
}

export default EditSubject