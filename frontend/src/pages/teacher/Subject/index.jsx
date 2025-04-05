import React, { useContext, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import backend from "../../../api/backend";
import { AuthContext } from "../../../context/AuthProvider";

import ArrowLeftIcon from '@mui/icons-material/ArrowLeft';
import { Alert, Button, Slide, Snackbar } from "@mui/material";

import style from "./css/addsubject.module.css";
import AddManual from "./addContents/addManual";
import AddPdf from "./addContents/AddPdf";

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
  const [ alertMessage, setAlertMessage ] = useState("");
  const [ openSnackbar, setOpenSnackbar ] = useState(false);

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

  const handleSubmit = async () => {
    const error = inputValidation();
    if (error) {
      setAlertMessage(error);
      setOpenSnackbar(true);
      return;
    }

    setAlertMessage("");
    setOpenSnackbar(false); 
  }

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  /* Input Format Functions */
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
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          slots={{ transition: SlideTransition }} 
        >
          <Alert onClose={handleCloseSnackbar} severity="error" variant="filled" sx={{ width: '100%' }}>
            {alertMessage}
          </Alert>
        </Snackbar>

        { mode === "1" && (
          <AddManual
            subjectInput={subjectInput}
            setSubjectInput={setSubjectInput}
            addContent={addContent}
            removeContent={removeContent}
            handleChange={handleChange}
            handleImageUpload={handleImageUpload}
            removeImage={removeImage}
            handleSubmit={handleSubmit}
          />
        )}

        { mode === "0" && (
          <AddPdf/>
        )}
      </div>
    </div>
  );
}

export default AddSubject;
