import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import backend from '../../../api/backend';

import style from './css/pretest.module.css';
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

function AlertDialog({ open, onClose, message }) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>แจ้งเตือน</DialogTitle>
      <DialogContent>
        <DialogContentText>
          {message}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary" autoFocus>ตกลง</Button>
      </DialogActions>
    </Dialog>
  );
}

function Pretest() {
  const { courseId, enrollmentId } = useParams();
  const { userData } = useContext(AuthContext);
  const [ question, setQuestion ] = useState([]);
  const [ selectedAnswers, setSelectedAnswers ] = useState({});
  const [ errorMessage, setErrorMessage ] = useState('');
  const [ expiredDialogOpen, setExpiredDialogOpen ] = useState(false);
  const [ alertDialog, setAlertDialog ] = useState({ open: false, message: "", redirect: null });
  const navigate = useNavigate();

   const checkPretestCompletion = async () => {
    try {
      const response = await backend.get(`/progress/checkCourseProgress/${enrollmentId}/${courseId}`, {
        withCredentials: true
      });

      if (response.status === 200) {
        const pretestProgress = response.data.pretest_progress;

        const pretestCompleted = pretestProgress.every((item) => item.is_completed === 1);

        if(pretestCompleted){
          setAlertDialog({
            open: true,
            message: "คุณได้ทำแบบทดสอบก่อนเรียนแล้ว ไม่อนุญาตให้ทำอีกครั้ง",
            redirect: -1
          });
          return;
        }
      }
    } catch (error) {
      console.log(error);
      if (
        error?.response?.status === 403 ||
        error?.response?.data?.message === "คอร์สนี้หมดอายุการเรียนแล้ว"
      ) {
        setExpiredDialogOpen(true);
      }
    }
  };

  const fetchPretestData = async () => {
    try{
      const response = await backend.get(`/pretest/getPretest/${enrollmentId}/${courseId}`, {
        withCredentials: true
      });

      if(response.status === 200){
        setQuestion(response.data.questions);
        setSelectedAnswers(
          response.data.questions.reduce((acc, question) => {
            acc[question.qId] = null;
            return acc;
          }, {})
        );
      }
        
    } catch(error){
      console.log(error);
      if(error.response.status === 404){
        setAlertDialog({
          open: true,
          message: "กรุณาลงทะเบียนเรียนใหม่ก่อนเข้าทำแบบทดสอบก่อนเรียน",
          redirect: `/course/${courseId}/null`
        });
      }
    }
  }

  const fetchLatestProgress = async () => {
    try {
      const response = await backend.get(`/progress/getLatestProgress/${enrollmentId}/${courseId}`, {
        withCredentials: true
      });

      if (response.status === 200) {
        navigate(`/course/${courseId}/${response.data.inProgress}`);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if(userData.id===null){
      setAlertDialog({
        open: true,
        message: "กรุณาเข้าสู่ระบบก่อน",
        redirect: '/'
      });
    }
    if (userData.id !== null) {
      checkPretestCompletion();
    }

    fetchPretestData();
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
      const response = await backend.put(`/pretest/submitPretest/${courseId}`, { answer: selectedAnswers, enrollmentId }, {
        withCredentials: true
      });

      if(response.status === 200 && response.data.message === "Progress pretest update completed."){
        setErrorMessage("ส่งคำตอบเสร็จสิ้น");
        setTimeout(() => {
          fetchLatestProgress();
        }, 3000);
      }
    } 
    catch (err) {
      console.log(err);
      if(err.response.status === 404){
        setErrorMessage("Please answer all question before submit.");
      }
    }
    
  };

  return (
    <div className={style.container}>
      <Typography variant='h4' >แบบทดสอบก่อนเรียน</Typography>

      <ExpiredDialog
        open={expiredDialogOpen}
        onClose={() => navigate(`/course/${courseId}/${enrollmentId}`)}
      />
      <AlertDialog
        open={alertDialog.open}
        message={alertDialog.message}
        onClose={() => {
          const redirectUrl = alertDialog.redirect;
          setAlertDialog({ open: false, message: "", redirect: null });
          if (redirectUrl) navigate(redirectUrl);
        }}
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
  )
}

export default Pretest