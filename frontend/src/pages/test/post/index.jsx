import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import backend from '../../../api/backend';

import style from "./css/posttest.module.css";
import { AuthContext } from '../../../context/AuthProvider';
import TestRead from '../../../components/Reader/TestRead';
import { Button, Typography } from '@mui/material';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";

function ExpiredDialog({ open, onClose }) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>คอร์สหมดอายุ หรือไม่พบการลงทะเบียน</DialogTitle>
      <DialogContent>
        <DialogContentText>
          ระยะเวลาการเรียนของคุณในคอร์สนี้อาจสิ้นสุดลงแล้ว หรือไม่พบข้อมูลการลงทะเบียนเรียน
          ระบบจะนำคุณกลับไปยังหน้ารายละเอียดคอร์ส
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary" autoFocus>
          ตกลง
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function PostTest() {
  const { courseId, enrollmentId } = useParams();
  const { userData } = useContext(AuthContext);
  const [ question, setQuestion ] = useState([]);
  const [ errorMessage, setErrorMessage ] = useState("");
  const [ selectedAnswers, setSelectedAnswers ] = useState({});
  const [ expiredDialogOpen, setExpiredDialogOpen ] = useState(false);
  const navigate = useNavigate();
  
  const checkLabCompletion = async () => {
    try {
      const response = await backend.get(`/progress/checkCourseProgress/${enrollmentId}/${courseId}`, {
        withCredentials: true
      });

      if (response.status === 200) {
        const pretestProgress = response.data.pretest_progress;
        const labProgress = response.data.lab_progress;

        const pretestCompleted = pretestProgress.every((item) => item.is_completed === 1);
        const labCompleted = labProgress.every((item) => item.is_completed === 1);

        if(!pretestCompleted && !labCompleted){
          alert("กรุณาทำแบบทดสอบก่อนเรียน และปฎิบัติการทดสอบทั้งหมดก่อน");
          navigate(-1);
          return;
        }
      }
    } catch (error) {
      console.log(error);
      if (
        error?.response?.status === 404 ||
        error?.response?.data?.message === "No courses found." ||
        error?.response?.data?.message === "คอร์สนี้หมดอายุการเรียนแล้ว"
      ) {
        setExpiredDialogOpen(true);
      }
    }
  };

  const fetchPosttestData = async () => {
    try {
      const response = await backend.get(`/posttest/getPosttest/${enrollmentId}/${courseId}`, {
        withCredentials: true
      });

      if (response.status === 200) {
        setQuestion(response.data.questions);
        setSelectedAnswers(
          response.data.questions.reduce((acc, question) => {
            acc[question.qId] = null;
            return acc;
          }, {})
        );
      }
    } catch (error) {
      console.log(error);
      if(error.response.status === 404){
        alert("Please enroll this course before posttest.");
        navigate('/');
      }
    }
  };

  useEffect(() => {
    localStorage.removeItem("selector-question-type");
    if (userData.id === null) {
      alert("Please login first.");
      navigate('/');
    }
    if (userData.id !== null) {
      checkLabCompletion();
    }

    fetchPosttestData();
  }, [userData.id, enrollmentId, courseId, navigate]);

  const handleAnswerChange = (questionId, answerId, content) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: {
        answerId,
        content
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const checkNullSelectedAnswer = Object.values(selectedAnswers).some(answer => answer === null);

    if(checkNullSelectedAnswer){
      setErrorMessage("กรุณาตอบคำถามทั้งหมด");
      return;
    }

    try {
      const response = await backend.put(`/posttest/submitPosttest/${courseId}`, { answer: selectedAnswers, enrollmentId }, {
        withCredentials: true
      });

      if (response.status === 200 ) {
        setErrorMessage("ส่งคำตอบเสร็จสิ้น");
        setTimeout(() => {
          navigate(`/course/${courseId}/${enrollmentId}`);
        }, 3000);
      }
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className={style.container}>
      <Typography variant='h4' >แบบทดสอบหลังเรียน</Typography>

      <ExpiredDialog
        open={expiredDialogOpen}
        onClose={() => navigate(`/course/${courseId}/${enrollmentId}`)}
      />

      <form onSubmit={handleSubmit}>
        <TestRead 
          question={question}
          handleAnswerChange={handleAnswerChange}
          selectedAnswers={selectedAnswers}
        />

        <Typography 
          variant='body2' 
          fontWeight="semi-bold" 
          color={errorMessage === "ส่งคำตอบเสร็จสิ้น" ? "green" : "red"}
        >
          {errorMessage}
        </Typography>
                
        <Button 
          variant="contained" 
          color="success" 
          type="submit"
        >
          ยืนยันคำตอบ
        </Button>
      </form>
    </div>
  );
}

export default PostTest;
