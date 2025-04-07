import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import backend from "../../../api/backend";
import { AuthContext } from "../../../context/AuthProvider";

import ArrowLeftIcon from '@mui/icons-material/ArrowLeft';
import { Alert, Button, Slide, Snackbar } from "@mui/material";

import style from "./css/addsubject.module.css";
import AddManual from "./addContents/addManual";
import AddPdf from "./addContents/AddPdf";
import AddQuestion from "./addContents/AddQuestion";
import PreviewManual from "./addContents/PreviewManual";

function SlideTransition(props) {
  return <Slide {...props} direction="left" />;
}

function AddSubject() {
  const { courseId, mode } = useParams();
  const { userData } = useContext(AuthContext);
  const navigate = useNavigate();
  const [ subjectInput, setSubjectInput ] = useState({ 
    name: "",
    content: []  
  });
  const [ questionType ] = useState([ "Pre", "Post", "Lab", "Quiz" ]);
  const [ questionInput, setQuestionInput ] = useState([
    {
      content: "",
      choice: [
        {
          content: "",
          isCorrect: false
        }
      ],
      img: "",
      type: questionType[0]
    },
    {
      content: "",
      choice: [
        {
          content: "",
          isCorrect: false
        }
      ],
      img: "",
      type: questionType[1]
    },
  ]);
  const [ alertMessage, setAlertMessage ] = useState("");
  const [ openSnackbar, setOpenSnackbar ] = useState(false);
  const [ PreviewPopupOpen, setPreviewPopupOpen ] = useState(false);

  useEffect(() => {
    if(mode === "manualQuestion" && (subjectInput.name === "" || subjectInput.content.length === 0)){
      setAlertMessage("Subject Name and Content is required");
      setOpenSnackbar(true);
      setTimeout(() => {
        navigate(`/add-subject/${courseId}/manual`);
      }, 3000);
    }
  }, [mode, subjectInput, navigate, courseId]);

  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  /* Input Format Functions */
  const addContent = () => {
    setSubjectInput({
      ...subjectInput,
      content: [
        ...subjectInput.content,
        {
          topic: "",
          description: "",
          imgs: []
        }
      ]
    });
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

  const inputValidation = () => {

    if(subjectInput.name === "") {
      return "Subject Name is required";
    }
    if(subjectInput.content.length === 0) {
      return "At least one content is required";
    }
    for (let i = 0; i < subjectInput.content.length; i++) {
      const item = subjectInput.content[i];
      if (item.topic === "") {
        return `Topic ${i + 1} is required`;
      }
      if (item.description === "") {
        return `Description for Topic ${i + 1} is required`;
      }
    }

    return;
  }

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
        if (correctChoices.length !== 1) {
          return `Question ${i + 1} of type "${item.type}" must have exactly one correct choice`;
        }
        const incorrectChoices = item.choice.filter(choice => !choice.isCorrect);
        if (incorrectChoices.length === 0) {
          return `Question ${i + 1} of type "${item.type}" must have at least one incorrect choice`;
        }
      }
    }

    return;
  }

  const handleSubmit = async () => {
    if (mode === "manual") {
      const error = inputValidation();
      if (error) {
        setAlertMessage(error);
        setOpenSnackbar(true);
        return;
      }

      setAlertMessage("");
      setOpenSnackbar(false);
      navigate(`/add-subject/${courseId}/manualQuestion`); 
    }
    
    if (mode === "pdf") {}

    if (mode === "question") {
      const error = questionValidation();
      if (error) {
        setAlertMessage(error);
        setOpenSnackbar(true);
        return;
      }

      try{
        const response = await backend.post(`/teacher/addSubject/${courseId}`, 
          {
            name: subjectInput.name,
            content: subjectInput.content,
            question: questionInput,
          }, { withCredentials: true }
        );

        if(response.status === 200){
          setAlertMessage(response.data.message);
          setOpenSnackbar(true);
        }
      } catch(error){
        console.log(error);
        setAlertMessage(error.response.data.message);
        setOpenSnackbar(true);
      }
    }
  }

  /* Input Format Functions */
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  
  const handlePreview = () => {
    const error = inputValidation();
    if(error){
      setAlertMessage(error);
      setOpenSnackbar(true);
      return;
    }
    setPreviewPopupOpen(true);
  };

  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  /* Input Question Functions */
  
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

  /* Input Question Functions */
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  return (
    <div className={style["add-subject-container"]}>
      <div className={style.container}>
        <Button 
          variant="contained" 
          startIcon={<ArrowLeftIcon />}
          onClick={() => navigate(-1)}
        >
          Back
        </Button>

        <Snackbar
          open={openSnackbar}
          autoHideDuration={5000}
          onClose={() => setOpenSnackbar(false)}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          slots={{ transition: SlideTransition }} 
        >
          <Alert 
            onClose={() => setOpenSnackbar(false)} 
            severity={
              alertMessage === "Subject created successfully." ? "success" : "error"
            } 
            variant="filled" 
            sx={{ width: '100%' }}
          >
            {alertMessage}
          </Alert>
        </Snackbar>

        { PreviewPopupOpen && (
          <PreviewManual
            subjectInput={subjectInput}
            PreviewPopupOpen={PreviewPopupOpen}
            setPreviewPopupOpen={setPreviewPopupOpen}
          />
        )}

        { mode === "manual" && (
          <AddManual
            subjectInput={subjectInput}
            setSubjectInput={setSubjectInput}
            addContent={addContent}
            removeContent={removeContent}
            handleChange={handleChange}
            handleImageUpload={handleImageUpload}
            removeImage={removeImage}
            handlePreview={handlePreview}
            handleSubmit={handleSubmit}
          />
        )}

        { mode === "pdf" && (
          <AddPdf/>
        )}

        { (mode === "manualQuestion" && subjectInput.name !== "" && subjectInput.content.length !== 0) && (
          <AddQuestion
            questionInput={questionInput}
            questionType={questionType}
            addQuestion={addQuestion}
            deleteQuestion={deleteQuestion}
            handleQuestionChange={handleQuestionChange}
            handleChoiceChange={handleChoiceChange}
            addChoice={addChoice}
            deleteChoice={deleteChoice}
            handleSubmit={handleSubmit}
          />
        )}
      </div>
    </div>
  );
}

export default AddSubject;
