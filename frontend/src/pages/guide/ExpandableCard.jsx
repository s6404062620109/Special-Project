import React, { useEffect, useState } from 'react';
import {
  Card, 
  CardContent, 
  CardActions, 
  Stack, 
  Typography,
  Collapse, 
  Button, 
  IconButton, 
  List, 
  ListItem, 
  ListItemText,
  useMediaQuery,
  Snackbar,
  Alert
} from '@mui/material';
import { ExpandMore, Delete } from '@mui/icons-material';
import backend from '../../api/backend';

const cardStyle = {
  width: "100%",
  borderRadius: "12px",
  boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
};

function ExpandableCard({ title, handlePreview, guideData = null }) {
  const [ expanded, setExpanded ] = useState(false);
  const [ uploadState, setUploadState ] = useState(false);
  const [ files, setFiles ] = useState([]);
  const [existingFiles, setExistingFiles] = useState([]);
  const [ deleteGuides, setDeleteGuides ] = useState("");
  const [alertInfo, setAlertInfo] = useState({ open: false, message: "", severity: "info" });

  const tabletMedia = useMediaQuery('(max-width: 768px)');

  const filesToShow = () => {
    if (title === "คู่มือการใช้งานสำหรับอาจารย์") {
      return [
        guideData?.teacherGuide && { name: "คู่มือสำหรับอาจารย์.pdf", url: guideData.teacherGuide, type: "application/pdf" },
        guideData?.labGuide && { name: "Lab Guide.html", url: guideData.labGuide, type: "text/html" },
        ...files,   
        ].filter(Boolean);
    } 
    else if (title === "คู่มือการใช้งานสำหรับนักเรียน") {
      return [
        guideData?.studentGuide && { name: "คู่มือสำหรับนักเรียน.pdf", url: guideData.studentGuide, type: "application/pdf" },
        ...files,
      ].filter(Boolean);
    }
    return files;
  };

  const allFilesToShow = filesToShow();

  const fileValidation = (file) => {
    const currentFiles = [...allFilesToShow];

    if (title === "คู่มือการใช้งานสำหรับอาจารย์") {
      if (currentFiles.length >= 2) {
        setAlertInfo({ open: true, message: "สามารถรับไฟล์ได้ไม่เกิน 2 ไฟล์ (PDF + HTML เท่านั้น)", severity: "warning" });
        return false;
      }

      const typesInFiles = currentFiles.map(f => f.type);

      if (file.type === "application/pdf" && typesInFiles.includes("application/pdf")) {
        setAlertInfo({ open: true, message: "มีไฟล์ PDF อยู่แล้ว ต้องอัพโหลดเป็น HTML เท่านั้น", severity: "warning" });
        return false;
      }

      if (file.type === "text/html" && typesInFiles.includes("text/html")) {
        setAlertInfo({ open: true, message: "มีไฟล์ HTML อยู่แล้ว ต้องอัพโหลดเป็น PDF เท่านั้น", severity: "warning" });
        return false;
      }

      if (file.type !== "application/pdf" && file.type !== "text/html") {
        setAlertInfo({ open: true, message: "ไฟล์ไม่ถูกต้อง กรุณาอัพโหลด PDF หรือ HTML เท่านั้น", severity: "error" });
        return false;
      }
    }

    if (title === "คู่มือการใช้งานสำหรับนักเรียน") {
      const hasPDF = currentFiles.some(f => f.type === "application/pdf");
      if (hasPDF && file.type === "application/pdf") {
        setAlertInfo({ open: true, message: "มีไฟล์ PDF สำหรับนักเรียนอยู่แล้ว", severity: "warning" });
        return false;
      }

      if (file.type !== "application/pdf") {
        setAlertInfo({ open: true, message: "ไฟล์ไม่ถูกต้อง กรุณาอัพโหลด PDF เท่านั้น", severity: "error" });
        return false;
      }
    }

    return true;
  };

  const handleExpandClick = () => setExpanded(!expanded);

  const handleFileUpload = (event) => {
    const newFiles = Array.from(event.target.files);

    newFiles.forEach(file => {
      if(!fileValidation(file)) return;

      if(title === "คู่มือการใช้งานสำหรับนักเรียน"){
        setFiles([file]);
      } else {
        setFiles(prev => [...prev, file]);
      }
    });
  };

  const handleRemoveFile = (index) => setFiles(prev => prev.filter((_, i) => i !== index));
  const handleClearAll = () => {
    setFiles([]);
    if(title === "คู่มือการใช้งานสำหรับอาจารย์"){
        setDeleteGuides("teacher");
    }
    if(title === "คู่มือการใช้งานสำหรับนักเรียน"){
        setDeleteGuides("student");
    }
  };

  const handleSubmit = async () => {
    const formData = new FormData();

    if (title === "คู่มือการใช้งานสำหรับอาจารย์") {
      let teacherGuide = files.find(f => f.type === "application/pdf");
      let labGuide = files.find(f => f.type === "text/html");

      if (teacherGuide) {
        formData.append("teacherGuide", teacherGuide);
      }
      if (labGuide) {
        formData.append("labGuide", labGuide);
      }
    } 
    else if (title === "คู่มือการใช้งานสำหรับนักเรียน") {
      let studentGuide = files.find(f => f.type === "application/pdf");
      if (studentGuide) {
        formData.append("studentGuide", studentGuide);
      }
    }

    if (deleteGuides !== "") {
      formData.append("deleteGuides", deleteGuides);
      setDeleteGuides("");
    }

    try {
      const response = await backend.post("/admin/updateGuide", formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.status === 200) {
        setAlertInfo({ open: true, message: response.data.message, severity: "success" });
        setTimeout(() => window.location.reload(), 2000);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleClearOldFiles = () => {
    setDeleteGuides("");

    if(title === "คู่มือการใช้งานสำหรับอาจารย์"){
      setDeleteGuides("teacher");
      setUploadState(false);
    }

    else if(title === "คู่มือการใช้งานสำหรับนักเรียน"){
      setDeleteGuides("student");
      setUploadState(false);
    }
  }

  useEffect(() => {
    if(deleteGuides !== ""){
        setUploadState(false);
        return;
    }
    if(title === "คู่มือการใช้งานสำหรับอาจารย์"){
        const hasPDF = files.some(f => f.type === "application/pdf");
        const hasHTML = files.some(f => f.type === "text/html");
        setUploadState(!(hasPDF && hasHTML));
        return;
    }

    if(title === "คู่มือการใช้งานสำหรับนักเรียน"){
        const hasPDF = files.some(f => f.type === "application/pdf");
        setUploadState(!hasPDF);
        return;
    }
  }, [files, title]);

  useEffect(() => {
    if(guideData){
      const filesList = [];
      if(guideData.studentGuide){
        filesList.push({ name: "คู่มือสำหรับนักเรียน.pdf", url: guideData.studentGuide, type: "application/pdf" });
      }
      if(guideData.teacherGuide){
        filesList.push({ name: "คู่มือสำหรับอาจารย์.pdf", url: guideData.teacherGuide, type: "application/pdf" });
      }
      if(guideData.labGuide){
        filesList.push({ name: "Lab Guide.html", url: guideData.labGuide, type: "text/html" });
      }
      setExistingFiles(filesList);
    }
  }, [guideData]);

  return (
    <Card style={cardStyle}>
      <Snackbar open={alertInfo.open} autoHideDuration={6000} onClose={() => setAlertInfo({ ...alertInfo, open: false })} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert onClose={() => setAlertInfo({ ...alertInfo, open: false })} severity={alertInfo.severity} sx={{ width: '100%' }}>
          {alertInfo.message}
        </Alert>
      </Snackbar>
      <CardActions
        onClick={handleExpandClick}
        sx={{
          display: "flex",
          justifyContent: "space-between",
          cursor: "pointer",
        }}
      >
        <Typography variant="h6">{title}</Typography>
        <IconButton
          sx={{
            transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.3s",
          }}
        >
          <ExpandMore />
        </IconButton>
      </CardActions>

      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <CardContent>
          <Stack
            direction="column"
            justifyContent="center"
            alignItems="center" 
            spacing={2}
          >
            {(title === "คู่มือการใช้งานสำหรับนักเรียน" && allFilesToShow.length === 0) || 
            (title === "คู่มือการใช้งานสำหรับอาจารย์" && allFilesToShow.length === 0) ? (
              <Button
                variant="outlined"
                component="label"
                sx={{ width: "100%" }}
              >
                {title === "คู่มือการใช้งานสำหรับอาจารย์" ? "อัพโหลด PDF / HTML" : "อัพโหลด PDF"}
                <input
                  type="file"
                  hidden
                  accept={title === "คู่มือการใช้งานสำหรับอาจารย์" ? "application/pdf,text/html" : "application/pdf"}
                  multiple={title === "คู่มือการใช้งานสำหรับอาจารย์"}
                  onChange={handleFileUpload}
                />
              </Button>
            ) : null}

            {allFilesToShow.length > 0 && (
                <List dense>
                    {allFilesToShow.map((file, index) => (
                    <ListItem
                        key={index}
                        secondaryAction={
                        files.includes(file) ? (
                            <IconButton edge="end" aria-label="delete" onClick={() => handleRemoveFile(files.indexOf(file))}>
                            <Delete />
                            </IconButton>
                        ) : null
                        }
                    >
                        <ListItemText primary={file.name} />
                    </ListItem>
                    ))}
                </List>
            )}

            {title === "คู่มือการใช้งานสำหรับอาจารย์" && files.length > 0 && (
              <Stack
                direction={tabletMedia ? "column" : "row"}
                justifyContent={tabletMedia ? "center" : "space-between"}
                alignItems="center"
                sx={{ 
                    width: tabletMedia ? "90%" : "100%",
                    margin: "16pxauto",
                    gap: 2 
                }}
              >
                <Button
                  variant="outlined"
                  component="label"
                  sx={{ width: "100%" }}
                >
                  เพิ่มไฟล์
                  <input
                    type="file"
                    hidden
                    accept="application/pdf,text/html"
                    multiple
                    onChange={handleFileUpload}
                  />
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={handleClearAll}
                  sx={{ width: "100%" }}
                >
                  ล้างไฟล์ทั้งหมด
                </Button>
              </Stack>
            )}

            {((title === "คู่มือการใช้งานสำหรับนักเรียน" && guideData?.studentGuide) ||
              (title === "คู่มือการใช้งานสำหรับอาจารย์" && (guideData?.teacherGuide || guideData?.labGuide))) && (
                <Button
                  variant="contained"
                  color="error"
                  sx={{ width: "100%" }}
                  onClick={handleClearOldFiles}
                >
                  เลือกลบไฟล์เก่าทั้งหมด
                </Button>
            )}
            

            <Button
                variant="contained"
                color="primary"
                disabled={allFilesToShow.length === 0}
                sx={{ width: "100%" }}
                onClick={() => {
                    const previewFile = allFilesToShow.find(f => f.type === "application/pdf" || f.type === "text/html");

                    if(!previewFile) return;

                    if(previewFile.url){
                        handlePreview(`http://${import.meta.env.VITE_DEV_URL}:${import.meta.env.VITE_BACKEND_PORT}/admin${previewFile.url}`);
                    } else {
                        const objectUrl = URL.createObjectURL(previewFile);
                        handlePreview(objectUrl);
                    }
                }}
            >
                ดูตัวอย่าง
            </Button>


            <Button
              variant="contained"
              color="primary"
              disabled={uploadState}
              sx={{ width: "100%" }}
              onClick={handleSubmit}
            >
              ยืนยัน
            </Button>

          </Stack>
        </CardContent>
      </Collapse>
    </Card>
  );
}

export default ExpandableCard;
