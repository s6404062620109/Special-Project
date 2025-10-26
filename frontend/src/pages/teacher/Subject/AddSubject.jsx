import React, { useContext, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import backend from "../../../api/backend";
import { AuthContext } from "../../../context/AuthProvider";

import ArrowLeftIcon from "@mui/icons-material/ArrowLeft";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import DescriptionIcon from "@mui/icons-material/Description";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Slide,
  Snackbar,
  Stack,
  Typography,
  useMediaQuery,
} from "@mui/material";

import style from "./css/subject.module.css";
import AddManual from "./addContents/AddManual";
import AddPdf, { VisuallyHiddenInput } from "./addContents/AddPdf";
import AddQuestion from "./addContents/AddQuestion";
import Preview from "./Preview";
import Reader from "../../../components/Reader";

function SlideTransition(props) {
  return <Slide {...props} direction="left" />;
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/* Input Format Functions */

const useSubjectForm = () => {
  const [subjectInput, setSubjectInput] = useState({ name: "", content: [] });

  const addContent = () => {
    setSubjectInput((prev) => ({
      ...prev,
      content: [...prev.content, { topic: "", description: "", imgs: [] }],
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
    updatedContent[contentIndex].imgs = updatedContent[
      contentIndex
    ].imgs.filter((_, i) => i !== imgIndex);
    setSubjectInput({ ...subjectInput, content: updatedContent });
  };

  const inputValidation = () => {
    if (subjectInput.name === "") return "กรุณากรอกชื่อบทเรียน";
    if (subjectInput.content.length === 0)
      return "กรุณากรอกเนื้อหาอย่างน้อย 1 หัวข้อสำหรับบทเรียน";

    for (let i = 0; i < subjectInput.content.length; i++) {
      const item = subjectInput.content[i];
      if (item.topic === "") return `กรุณากรอกชื่อหัวข้อที่ ${i + 1}`;
      if (item.description === "")
        return `กรุณากรอกคำอธิบายสำหรับหัวข้อที่ ${i + 1}`;
    }

    return null;
  };

  return {
    subjectInput,
    setSubjectInput,
    addContent,
    removeContent,
    handleChange,
    handleImageUpload,
    removeImage,
    inputValidation,
  };
};

/* Input Format Functions */
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/* Input Pdf Functions */

const usePdfForm = () => {
  const [subjectPdfInput, setSubjectPdfInput] = useState({
    name: "",
    file: null,
  });
  const inputRef = useRef(null);

  const handleBoxClick = () => {
    inputRef.current.click();
  };

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile && selectedFile.type === "application/pdf") {
      setSubjectPdfInput({ ...subjectPdfInput, file: selectedFile });
    }
  };

  const pdfValidation = () => {
    if (subjectPdfInput.name === "") {
      return "กรุณากรอกชื่อบทเรียน";
    }

    if (!subjectPdfInput.file) {
      return "กรุณาอัพโหลดไฟล์ PDF สำหรับบทเรียน";
    }

    if (subjectPdfInput.file.type !== "application/pdf") {
      return "กรุณาอัพโหลดไฟล์ PDF เท่านั้น";
    }

    if (subjectPdfInput.file.size > 16 * 1024 * 1024) {
      return "ขนาดไฟล์ PDF ต้องไม่เกิน 16MB";
    }

    return null;
  };

  return {
    subjectPdfInput,
    setSubjectPdfInput,
    inputRef,
    handleBoxClick,
    handleFileChange,
    pdfValidation,
  };
};

/* Input Pdf Functions */
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/* Input Question Functions */

const useQuestionForm = (setAlertMessage, setOpenSnackbar) => {
  const [questionType, setQuestionType] = useState([]);
  const [questionInput, setQuestionInput] = useState([]);
  const [openImgUpload, setOpenImgUpload] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);
  const [selectedLabIndex, setSelectedLabIndex] = useState(null);
  const [openLabsUpload, setOpenLabsUpload] = useState(null);
  const questionImgInputRef = useRef(null);

  const handleQuestionChange = (index, field, value) => {
    if (field === "type") {
      return;
    }

    setQuestionInput((prevQuestions) => {
      const question = prevQuestions[index];
      if (!question || question[field] === value) return prevQuestions;

      const updatedQuestion = { ...question, [field]: value };
      const newQuestions = [...prevQuestions];
      newQuestions[index] = updatedQuestion;
      return newQuestions;
    });
  };

  const handleQuestionTypeChange = (index, type) => {
    setQuestionInput((prevQuestions) => {
      return prevQuestions.map((question, qIndex) => {
        if (qIndex !== index) return question;

        if (type === 4) {
          return {
            type: type,
            content: question.content || "",
            img: question.img || null,
            answer: "",
            Cmdfile: null,
          };
        } else if (type === 5) {
          return {
            type: type,
            content: question.content || "",
            img: question.img || null,
            answer: "",
            htmlFile: null,
          };
        } else {
          return {
            type: type,
            content: question.content || "",
            img: question.img || null,
            choice: [{ content: "", isCorrect: false }],
          };
        }
      });
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

    if (files.length === 0) {
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
  };

  const handleLabfileUpload = (index, event, action) => {
    const files = Array.from(event.target.files);
    const updatedQuestions = [...questionInput];

    if (action === "Cmd") {
      if (!files[0].name.endsWith(".sh")) {
        setAlertMessage(
          `Question ${index + 1}: Only .sh files are allowed for Cmdfile.`
        );
        setOpenSnackbar(true);
        return;
      }

      updatedQuestions[index].Cmdfile = files[0];
    } else if (action === "Web") {
      if (!files[0].name.endsWith(".html")) {
        setAlertMessage(
          `Question ${index + 1}: Only .html files are allowed for htmlFile.`
        );
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

    if (att === "Cmd") {
      if (cmdPath) {
        setFilePathDelete((prev) => [...prev, cmdPath]);
      }
      updatedQuestions[index].Cmdfile = null;
    } else if (att === "Web") {
      if (htmlPath) {
        setFilePathDelete((prev) => [...prev, htmlPath]);
      }
      updatedQuestions[index].htmlFile = null;
    }

    setQuestionInput(updatedQuestions);
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
      type: null,
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
    if (questionInput.length === 0) {
      return "กรุณากรอกคำถามอย่างน้อย 1 ข้อ";
    }

    for (let i = 0; i < questionInput.length; i++) {
      const item = questionInput[i];
      if (item.content === "") {
        return `คำถามที่ ${i + 1} ต้องการเนื้อหาสำหรับคำถาม`;
      }

      if (!item.type) {
        return `กรุณาเลือกประเภทสำหรับคำถามที่ ${i + 1}`;
      }

      if (item.type === 3 || item.type === 6) {
        if (item.choice.length === 0) {
          return `ต้องการตัวเลือกอย่างน้อย 1 ตัวสำหรับคำถามที่ ${i + 1}`;
        }
        for (let j = 0; j < item.choice.length; j++) {
          const choice = item.choice[j];
          if (choice.content === "") {
            return `ตัวเลือกที่ ${j + 1} ของคำถามที่ ${i + 1} ต้องการมีเนื้อหาสำหรับตัวเลือก`;
          }
        }

        const correctChoices = item.choice.filter((choice) => choice.isCorrect === 1 || choice.isCorrect === true );
        if (item.type === 6 && correctChoices.length <= 1) {
          return `คำถามที่ ${i + 1} ประเภทคคำตอบหลายคำตอบ ต้องการตัวเลือกที่ถูกต้องมากกว่า 1 ตัวเลือก`;
        }
        if (item.type === 3 && correctChoices.length !== 1 ){
          return `คำถามที่ ${i + 1} ประเภทคำตอบเดียว ต้องการตัวเลือกที่ถูกต้อง 1 ตัวเลือกเท่านั้น`;
        }

        const incorrectChoices = item.choice.filter(
          (choice) => choice.isCorrect === 0 || choice.isCorrect === false 
        );
        if (item.type === 6 && incorrectChoices.length < 1) {
          return `คำถามที่ ${i + 1} ประเภทคคำตอบหลายคำตอบ ต้องการตัวเลือกที่ผิดอย่างน้อย 1 ตัวเลือก`;
        }
        if (item.type === 3 && incorrectChoices.length < 1 ){
          return `คำถามที่ ${i + 1} ประเภทคคำตอบเดียว ต้องการตัวเลือกที่ผิดอย่างน้อย 1 ตัวเลือก`;
        }
      }

      if (item.type === 5) {
        if (item.htmlFile === null) {
          return `กรุณาอัพโหลดไฟล์ HTML ณ คำถามที่ ${i + 1}`;
        }
        if (item.htmlFile) {
          if (!item.htmlFile.name.endsWith(".html")) {
            return `คำถามที่ ${i + 1} ต้องการไฟล์ HTML เท่านั้น`;
          }
        }

        if (item.answer === "") {
          return `คำถามที่ ${i + 1} ต้องการคำตอบสำหรับคำถามนี้`;
        }
      }

      if (item.type === 4) {

        if (item.answer === "") {
          return `คำถามที่ ${i + 1} ต้องการคำตอบสำหรับคำถามนี้`;
        }
      }
    }

    return;
  };

  return {
    questionType,
    setQuestionType,
    questionInput,
    setQuestionInput,
    openImgUpload,
    openLabsUpload,
    setOpenImgUpload,
    questionImgInputRef,
    selectedImageIndex,
    selectedLabIndex,
    handleOpenLabUpload,
    handleCloseLabUpload,
    handleOpenImgDialog,
    handleCloseImgUpload,
    handleImageQuestionUpload,
    handleLabfileUpload,
    handleLabFileDelete,
    handleQuestionChange,
    handleQuestionTypeChange,
    handleChoiceChange,
    addQuestion,
    addChoice,
    deleteChoice,
    deleteQuestion,
    questionValidation,
  };
};

/* Input Question Functions */
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const toBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

function AddSubject() {
  const { courseId, mode } = useParams();
  const { userData } = useContext(AuthContext);
  const navigate = useNavigate();
  const tabletQuery = useMediaQuery("(min-width: 768px)");
  const [previewContent, setPreviewContent] = useState(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [PreviewPopupOpen, setPreviewPopupOpen] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const prevMode = localStorage.getItem("prevMode");
  const {
    subjectInput,
    setSubjectInput,
    addContent,
    removeContent,
    handleChange,
    handleImageUpload,
    removeImage,
    inputValidation,
  } = useSubjectForm();
  const {
    subjectPdfInput,
    setSubjectPdfInput,
    inputRef,
    handleBoxClick,
    handleFileChange,
    pdfValidation,
  } = usePdfForm();
  const {
    questionType,
    setQuestionType,
    questionInput,
    setQuestionInput,
    openImgUpload,
    openLabsUpload,
    questionImgInputRef,
    selectedImageIndex,
    selectedLabIndex,
    handleOpenLabUpload,
    handleCloseLabUpload,
    handleOpenImgDialog,
    handleCloseImgUpload,
    handleImageQuestionUpload,
    handleLabfileUpload,
    handleLabFileDelete,
    handleQuestionChange,
    handleQuestionTypeChange,
    handleChoiceChange,
    addQuestion,
    addChoice,
    deleteChoice,
    deleteQuestion,
    questionValidation,
  } = useQuestionForm(setAlertMessage, setOpenSnackbar);

  useEffect(() => {
    setQuestionType([ 3, 4, 5, 6 ]);
  }, []);

  useEffect(() => {
    if (questionType.length > 0 && questionInput.length === 0) {
      addQuestion();
    }
  }, [questionType]);

  useEffect(() => {
    const prevMode = localStorage.getItem("prevMode");
    if (prevMode !== "manual" && prevMode !== "pdf") {
      setAlertMessage("กรุณาเลือกโหมดการเพิ่มบทเรียน");
      setOpenSnackbar(true);
      setTimeout(() => {
        navigate(`/edit-course/${courseId}`);
      }, 1500);
      return;
    }
    const checkInitialCondition = () => {
      if (mode === "question") {
        if (prevMode === "manual") {
          if (subjectInput.name === "" || subjectInput.content.length === 0) {
            setAlertMessage("กรุณากรอกชื่อบทเรียนและเพิ่มเนื้อหาอย่างน้อย 1 หัวข้อ");
            setOpenSnackbar(true);
            setTimeout(() => {
              navigate(`/add-subject/${courseId}/manual`);
            }, 3000);
            return;
          }
        }

        if (prevMode === "pdf") {
          if (!subjectPdfInput.file) {
            setAlertMessage("กรุณาอัพโหลดไฟล์ PDF สำหรับบทเรียน");
            setOpenSnackbar(true);
            setTimeout(() => {
              navigate(`/add-subject/${courseId}/pdf`);
            }, 3000);
            return;
          }
        }
      }

      if (mode === "submit") {
        if (prevMode === "manual") {
          if (
            subjectInput.name === "" ||
            subjectInput.content.length === 0 ||
            questionInput.length === 0
          ) {
            setAlertMessage("กรุณากรอกชื่อบทเรียน, เพิ่มเนื้อหาอย่างน้อย 1 หัวข้อ และเพิ่มปฏิบัติการทดสอบอย่างน้อย 1 ข้อ");
            setOpenSnackbar(true);
            setTimeout(() => {
              navigate(`/add-subject/${courseId}/manual`);
            }, 3000);
            return;
          }
        }

        if (prevMode === "pdf") {
          if (subjectPdfInput.name === "" || !subjectPdfInput.file) {
            setAlertMessage("กรุณากรอกชื่อบทเรียน, อัพโหลดไฟล์ PDF และเพิ่มปฏิบัติการทดสอบอย่างน้อย 1 ข้อ");
            setOpenSnackbar(true);
            setTimeout(() => {
              navigate(`/add-subject/${courseId}/pdf`);
            }, 3000);
            return;
          }
        }
      }

      setLoading(false);
    };

    checkInitialCondition();
  }, [mode, subjectInput, questionInput, subjectPdfInput, navigate, courseId]);

  if (loading) {
    return (
      <div className={style["loading-container"]}>
        <CircularProgress size={60} thickness={5} color="secondary" />
      </div>
    );
  }

  const onUploadImage = (index, event) => {
    const error = handleImageUpload(index, event);
    if (error) {
      setAlertMessage(error);
      setOpenSnackbar(true);
    }
  };

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
      localStorage.setItem("prevMode", "manual");
      navigate(`/add-subject/${courseId}/question`);
    } else if (mode === "pdf") {
      const error = pdfValidation();
      if (error) {
        setAlertMessage(error);
        setOpenSnackbar(true);
        return;
      }

      setAlertMessage("");
      setOpenSnackbar(false);
      localStorage.setItem("prevMode", "pdf");
      navigate(`/add-subject/${courseId}/question`);
    } else if (mode === "question") {
      const error = questionValidation();
      if (error) {
        setAlertMessage(error);
        setOpenSnackbar(true);
        return;
      }
      navigate(`/add-subject/${courseId}/submit`);
    } else if (mode === "submit") {
      if (prevMode === "manual") {
        const inputError = inputValidation();
        const questionError = questionValidation();

        if (inputError || questionError) {
          setAlertMessage(inputError || questionError);
          setOpenSnackbar(true);
          return;
        }
      }

      if (prevMode === "pdf") {
        const pdfError = pdfValidation();
        const questionError = questionValidation();

        if (pdfError || questionError) {
          setAlertMessage(inputError || questionError);
          setOpenSnackbar(true);
          return;
        }
      }

      setOpenDialog(true);
    }
  };

  const handleSubmitDialog = async () => {
    const formData = new FormData();

    if (prevMode === "manual") {
      formData.append("name", subjectInput.name);
      formData.append("content", JSON.stringify(subjectInput.content));
    }

    if (prevMode === "pdf") {
      formData.append("name", subjectPdfInput.name);
      formData.append("file", subjectPdfInput.file);
    }

    const clonedQuestions = await Promise.all(
      questionInput.map(async (q, qIndex) => {
        const newQ = { ...q };

        if (q.img && typeof q.img !== "string") {
          newQ.img = await toBase64(q.img);
        }

        if (q.Cmdfile) {
          formData.append(`cmdFile_${qIndex}`, q.Cmdfile);
          newQ.Cmdfile = `cmdFile_${qIndex}`;
        }

        if(q.htmlFile) {
          formData.append(`htmlFile_${qIndex}`, q.htmlFile);
          newQ.Htmlfile = `htmlFile_${qIndex}`;
        }

        if (Array.isArray(q.Labfiles)) {
          newQ.Labfiles = q.Labfiles.map((file, fileIndex) => {
            const key = `labFile_${qIndex}_${fileIndex}`;
            formData.append(key, file);
            return key;
          });
        }

        return newQ;
      })
    );

    formData.append("question", JSON.stringify(clonedQuestions));

    const url =
      prevMode === "manual"
        ? `/teacher/addSubject/${courseId}`
        : `/teacher/addPdfSubject/${courseId}`;

    try {
      const response = await backend.post(url, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });

      if (response.status === 200) {
        setAlertMessage(response.data.message);
        setOpenSnackbar(true);
        setTimeout(() => navigate(`/edit-course/${courseId}`), 3000);
      }
    } catch (error) {
      console.log(error);
      setAlertMessage(error.response?.data?.message || "Upload failed");
      setOpenSnackbar(true);
    }
  };

  const handlePreview = () => {
    if (mode === "manual") {
      const error = inputValidation();
      if (error) {
        setAlertMessage(error);
        setOpenSnackbar(true);
        return;
      }

      setPreviewContent(subjectInput);
      setPreviewPopupOpen(true);
    }

    if (mode === "pdf") {
      const error = pdfValidation();
      if (error) {
        setAlertMessage(error);
        setOpenSnackbar(true);
        return;
      }

      if (subjectPdfInput.name !== "" && subjectPdfInput.file) {
        setPreviewContent(subjectPdfInput);
        setPreviewPopupOpen(true);
      }
    }

    if (mode === "question") {
      const error = questionValidation();
      if (error) {
        setAlertMessage(error);
        setOpenSnackbar(true);
        return;
      }

      setPreviewContent(null);
      setPreviewPopupOpen(true);
    }
  };

  return (
    <div className={style.pageWrapper}>
      <div className={style.container}>
        {!tabletQuery ? (
          <IconButton
            sx={{
              backgroundColor: "rgb(25, 118, 210)",
              color: "white",
              "&:hover": {
                backgroundColor: "rgb(25, 118, 210)",
              },
            }}
            onClick={() => navigate(-1)}
          >
            <ArrowLeftIcon />
          </IconButton>
        ) : (
          <Button
            variant="contained"
            startIcon={<ArrowLeftIcon />}
            onClick={() => navigate(-1)}
          >
            ย้อนกลับ
          </Button>
        )}

        <Snackbar
          open={openSnackbar}
          autoHideDuration={5000}
          onClose={() => setOpenSnackbar(false)}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          slots={{ transition: SlideTransition }}
        >
          <Alert
            onClose={() => setOpenSnackbar(false)}
            severity={alertMessage === "สร้างบทเรียนสำเร็จ" ? "success" : "error" }
            variant="filled"
            sx={{ width: "100%" }}
          >
            {alertMessage}
          </Alert>
        </Snackbar>

        {PreviewPopupOpen &&
          mode === "pdf" &&
          subjectPdfInput.name !== "" &&
          subjectPdfInput.file !== null && (
            <Preview
              subjectInput={previewContent}
              questionInput={null}
              PreviewPopupOpen={PreviewPopupOpen}
              setPreviewPopupOpen={setPreviewPopupOpen}
            />
          )}

        {PreviewPopupOpen &&
          mode === "manual" &&
          subjectInput.name !== "" &&
          subjectInput.content.length !== 0 && (
            <Preview
              subjectInput={subjectInput}
              questionInput={null}
              PreviewPopupOpen={PreviewPopupOpen}
              setPreviewPopupOpen={setPreviewPopupOpen}
            />
          )}

        {PreviewPopupOpen &&
          mode === "question" &&
          questionInput.length !== 0 && (
            <Preview
              subjectInput={null}
              questionInput={questionInput}
              PreviewPopupOpen={PreviewPopupOpen}
              setPreviewPopupOpen={setPreviewPopupOpen}
            />
          )}

        {mode === "manual" && (
          <AddManual
            subjectInput={subjectInput}
            setSubjectInput={setSubjectInput}
            addContent={addContent}
            removeContent={removeContent}
            handleChange={handleChange}
            handleImageUpload={onUploadImage}
            removeImage={removeImage}
            handlePreview={handlePreview}
            handleSubmit={handleSubmit}
          />
        )}

        {mode === "pdf" && (
          <AddPdf
            handlePreview={handlePreview}
            subjectPdfInput={subjectPdfInput}
            setSubjectPdfInput={setSubjectPdfInput}
            inputRef={inputRef}
            handleBoxClick={handleBoxClick}
            handleFileChange={handleFileChange}
            handleSubmit={handleSubmit}
            pdfValidation={pdfValidation}
          />
        )}

        {mode === "question" &&
          (prevMode === "manual" || prevMode === "pdf") && (
            <AddQuestion
              questionInput={questionInput}
              questionType={questionType}
              handleOpenLabUpload={handleOpenLabUpload}
              handleOpenImgDialog={handleOpenImgDialog}
              addQuestion={addQuestion}
              deleteQuestion={deleteQuestion}
              handleQuestionChange={handleQuestionChange}
              handleQuestionTypeChange={handleQuestionTypeChange}
              handleChoiceChange={handleChoiceChange}
              addChoice={addChoice}
              deleteChoice={deleteChoice}
              handlePreview={handlePreview}
              handleSubmit={handleSubmit}
            />
          )}

        {mode === "submit" &&
          questionInput.length !== 0 &&
          ((prevMode === "manual" &&
            subjectInput.name !== "" &&
            subjectInput.content.length !== 0) ||
            (prevMode === "pdf" &&
              subjectPdfInput.name !== "" &&
              subjectPdfInput.file !== null)) && (
            <Stack>
              <Reader
                content={
                  subjectInput.name !== "" && subjectInput.content.length !== 0
                    ? subjectInput
                    : subjectPdfInput
                }
                question={questionInput}
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
                  variant="outlined"
                  sx={{
                    background: "red",
                    color: "white",
                    width: { xs: "100%", sm: "50%" },
                  }}
                  onClick={() => {
                    localStorage.removeItem("editMode");
                    localStorage.removeItem("prevMode");

                    navigate(`/edit-course/${courseId}`);
                  }}
                >
                  ยกเลิก
                </Button>

                <Button
                  variant="contained"
                  sx={{
                    background: "green",
                    width: { xs: "100%", sm: "50%" },
                  }}
                  onClick={handleSubmit}
                >
                  ยืนยัน
                </Button>
              </Stack>
            </Stack>
          )}

        {selectedLabIndex !== -1 && openLabsUpload === "cmd" && (
          <Dialog
            open={openLabsUpload === "cmd"}
            onClose={() => handleCloseLabUpload()}
          >
            <DialogTitle>คำถามที่ {selectedLabIndex + 1} Shell Script File</DialogTitle>
            <DialogContent>
              <Box>
                <Stack justifyContent="center" alignItems="center">
                  {questionInput[selectedLabIndex]?.Cmdfile && (
                    <Stack
                      direction="row"
                      justifyContent="center"
                      alignItems="center"
                      gap={1}
                    >
                      <DescriptionIcon />
                      <Typography variant="body2">
                        {questionInput[selectedLabIndex].Cmdfile.name}
                      </Typography>

                      <IconButton
                        onClick={() =>
                          handleLabFileDelete(selectedLabIndex, 0, "Cmd")
                        }
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Stack>
                  )}

                  <VisuallyHiddenInput
                    type="file"
                    id={`cmd-upload-${selectedLabIndex}`}
                    multiple
                    onChange={(e) =>
                      handleLabfileUpload(selectedLabIndex, e, "Cmd")
                    }
                  />

                  <label htmlFor={`cmd-upload-${selectedLabIndex}`}>
                    <Button variant="contained" component="span">
                      อัพโหลดไฟล์ Shell Script
                    </Button>
                  </label>
                </Stack>
              </Box>
            </DialogContent>
          </Dialog>
        )}

        {selectedLabIndex !== -1 && openLabsUpload === "web" && (
          <Dialog
            open={openLabsUpload === "web"}
            onClose={() => handleCloseLabUpload()}
          >
            <DialogTitle>คำถามที่ {selectedLabIndex + 1} HTML File</DialogTitle>
            <DialogContent>
              <Box>
                <Stack justifyContent="center" alignItems="center">
                  {questionInput[selectedLabIndex]?.htmlFile && (
                    <Stack
                      direction="row"
                      justifyContent="center"
                      alignItems="center"
                      gap={1}
                    >
                      <DescriptionIcon />
                      <Typography variant="body2">
                        {questionInput[selectedLabIndex].htmlFile.name}
                      </Typography>

                      <IconButton
                        onClick={() =>
                          handleLabFileDelete(selectedLabIndex, 0, "Web")
                        }
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Stack>
                  )}

                  <VisuallyHiddenInput
                    type="file"
                    id={`cmd-upload-${selectedLabIndex}`}
                    multiple
                    onChange={(e) =>
                      handleLabfileUpload(selectedLabIndex, e, "Web")
                    }
                  />

                  <label htmlFor={`cmd-upload-${selectedLabIndex}`}>
                    <Button variant="contained" component="span">
                      อัพโหลดไฟล์ HTML
                    </Button>
                  </label>
                </Stack>
              </Box>
            </DialogContent>
          </Dialog>
        )}

        <Dialog open={openImgUpload} onClose={handleCloseImgUpload}>
          <DialogTitle>อัพโหลดรูปภาพสำหรับคำถามที่ {selectedImageIndex + 1}</DialogTitle>
          <DialogContent>
            <Box
              onClick={() => questionImgInputRef.current?.click()}
              sx={{
                width: "400px",
                height: "200px",
                border: "1px dashed #b3b3b3",
                borderRadius: "8px",
                position: "relative",
                "&:hover": {
                  borderColor: "#888",
                  background: "#f0f0f0",
                  cursor: "pointer",
                },
              }}
            >
              <Stack
                direction="column"
                justifyContent="center"
                alignItems="center"
                sx={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                }}
              >
                  {questionInput[selectedImageIndex]?.img ? (
                    <>
                      <img
                        src={questionInput[selectedImageIndex].img}
                        alt="Selected Image"
                        style={{ width: '100%', height: '100%' }}
                      />
                      <Typography 
                        variant="body1" 
                        sx={{ 
                          color: '#666', 
                          mt: 1 
                        }}
                      >
                        เลือกรูปภาพที่ต้องการอัพโหลดแล้ว ✔
                      </Typography>
                    </>
                  ) : (
                    <Stack justifyContent="center" alignItems="center">
                      <AddIcon sx={{ color: '#b3b3b3' }} />
                      <Typography variant="h6" sx={{ color: '#b3b3b3' }}>
                        อัพโหลดรูปภาพที่นี้
                      </Typography>
                    </Stack>
                  )}
              </Stack>

              <VisuallyHiddenInput
                ref={questionImgInputRef}
                type="file"
                onChange={(e) =>
                  handleImageQuestionUpload(selectedImageIndex, e)
                }
                accept="image/*"
              />
            </Box>

            <Stack
              direction="row"
              justifyContent="flex-end"
              sx={{
                marginTop: "16px",
              }}
            >
              <Button
                variant="contained"
                component="label"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={() =>
                  handleImageQuestionUpload(selectedImageIndex, {
                    target: { files: [] },
                  })
                }
              >
                ยกเลิก
              </Button>
            </Stack>
          </DialogContent>
        </Dialog>

        <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
          <DialogTitle>ยืนยันการส่งข้อมูล</DialogTitle>
          <DialogContent>
            <Typography variant="body1">
              คุณต้องการส่งข้อมูลเนื้อหาและคำถามทั้งหมดใช่หรือไม่?
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>ยกเลิก</Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmitDialog}
            >
              ยืนยัน
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </div>
  );
}

export default AddSubject;
