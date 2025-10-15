import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import backend from "../../../api/backend";
import { AuthContext } from "../../../context/AuthProvider";

import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SchoolIcon from '@mui/icons-material/School';
import {
  Avatar,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Snackbar,
  Alert,
  useMediaQuery,
} from "@mui/material";

import style from "./css/editcourse.module.css";
import EditPopup from "./EditPopup";
import { LineChart } from "@mui/x-charts";
import TestPopup from "./TestPopup";
import SettingPopup from "./SettingPopup";

function EditCourse() {
  const { courseId } = useParams();
  const { userData } = useContext(AuthContext);
  const [ data, setData ] = useState({
    courseInfo: {},
    subject: [],
    countQuestions: 0,
    countLabs: 0,
  });
  const [ chartData, setChartData ] = useState(null);
  const [ editPopupOpen, setEditPopupOpen ] = useState(false);
  const [ fixCoursePopup, setFixCoursePopup ] = useState(false);
  const [ subjectPopupOpen, setSubjectPopupOpen ] = useState(false);
  const [ examDialogOpen, setExamOpenDialog ] = useState(false);
  const navigate = useNavigate();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [subjectToDelete, setSubjectToDelete] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info" });

  const fetchSubjects = async () => {
    try {
      const response = await backend.get(`/subjects/getAllSubject/${courseId}`, { withCredentials: true });

      if (response.status === 200) {
        setData({
          courseInfo: response.data.courseInfo,
          subject: response.data.subject,
          countQuestions: response.data.countQuestions,
          countLabs: response.data.countLabs,
        });
      }
    } catch (error) {
      console.log(error);
    }
  };
  
  const fetchProgressAnalysis = async () => {
    try {
      const response = await backend.get(`/teacher/testAnalysis/${courseId}`,
        {
          withCredentials: true,
        }
      );

      if (response.status === 200) {
        setChartData(response.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, [courseId]);

  useEffect(() => {
    if (data.subject.length === 0) return;

    fetchProgressAnalysis();
  }, [data.subject]);

  const handleEdit = (subjectId) => {
    navigate(`/edit-subject/${courseId}/${subjectId}`);
  };

  const handleDeleteClick = (subjectId) => {
    setSubjectToDelete(subjectId);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setSubjectToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!subjectToDelete) return;
    try {
      const response = await backend.delete(
        `/teacher/deleteSubjectOnCourse/${courseId}/${subjectToDelete}/${userData.id}`,
        {
          withCredentials: true,
        }
      );
      if (response.status === 200) {
        setSnackbar({ open: true, message: response.data.message, severity: "success" });
        setData((prevData) => ({
          ...prevData,
          subject: prevData.subject.filter(
            (subject) => subject.id !== subjectToDelete
          ),
        }));
      }
    } catch (error) {
      console.log(error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || "Error deleting subject",
        severity: "error",
      });
    } finally {
      handleCloseDeleteDialog();
    }
  };

  const handleSaveCourse = () => {
    setFixCoursePopup(false);
    fetchSubjects();
  };

  const handleSettingCourse = () => {
    setEditPopupOpen(false);
    fetchSubjects();
  }

  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  const tabletQuery = useMediaQuery("(max-width:720px)");
  const isXs = useMediaQuery("(max-width:600px)");
  const isSm = useMediaQuery("(max-width:900px)");

  const lineChartData = chartData?.users?.map((u, index) => {
      const duplicateCount = chartData.users.filter(
        (user) => user.name === u.name
      ).length;
      const nameWithId = duplicateCount > 1 ? `${u.name}-ครั้งที่ ${index+1}` : u.name;

      return {
        userId: u.userId,
        x: nameWithId,
        email: u.email,
        pretest: u.pretestScore,
        posttest: u.posttestScore,
      };
    }
  ) || [];

  const maxY = Math.max(
    chartData?.pretestMax || 0,
    chartData?.posttestMax || 0,
  );

  return (
    <div className={style.pageWrapper}>
      <div className={style.container}>
        <div className={style.head}>
          <div className={style["info-wrapper"]}>
            {data.courseInfo.icon ? (
              <img
                alt="course icon"
                src={data.courseInfo.icon}
                style={{
                  width: "50px",
                  height: "50px",
                  borderRadius: "8px",
                }}
              />
            ):(
              <Avatar sx={{ width: 50, height: 50, marginRight: "10px", bgcolor: "#1976d2" }}>
                <SchoolIcon />
              </Avatar>
            )}
            
            <h2>{data.courseInfo.name}</h2>
            <IconButton onClick={() => setFixCoursePopup(true)}>
              <EditIcon />
            </IconButton>
          </div>

          <Stack
            justifyContent="center"
            alignItems="center"
            direction={{ xs: "column", sm: "row", md: "column"}}
            sx={{
              width: { xs: "100%", md:"30%"},
              gap: 2
            }}
          >
              <Button
                variant="contained"
                sx={{
                  width: { xs: "100%", sm: "50%" },
                  backgroundColor: "#2e9b33ff",
                }}
                onClick={() => navigate(`/enrollment-summary/${courseId}`)}
              >
                รายชื่อผู้เรียน
              </Button>

              <Button
                variant="contained"
                sx={{
                  width: { xs: "100%", sm: "50%" },
                }}
                onClick={() => setExamOpenDialog(true)}
              >
                คลังข้อสอบ
              </Button>

              <Button
                variant="contained"
                sx={{
                  width: { xs: "100%", sm: "50%" },
                  backgroundColor: "#868686ff",
                }}
                onClick={() => setEditPopupOpen(true)}
              >
                ตั้งค่าคอร์ส
              </Button>
          </Stack>
          
        </div>

        <div className={style.body}>

          <div className={style.tableWrapper}>
            <table className={style.subjectTable}>
              <thead>
                <tr>
                  <th>
                    <Typography variant="body1" fontWeight={600}>บทเรียน</Typography>
                  </th>
                  <th colSpan={3}></th>
                </tr>
              </thead>
              <tbody>
                {data.subject.length > 0 ? (
                  data.subject.map((subject, index) => (
                    <tr key={subject.id}>
                      <td>
                        <Typography variant="body2">
                            {index+1}. {subject.name}
                        </Typography>
                      </td>
                      <td>
                        {tabletQuery ? (
                          <IconButton
                            sx={{
                              backgroundColor: "rgb(25, 118, 210)",
                              color: "white",
                              "&:hover": {
                                backgroundColor: "rgb(25, 118, 210)",
                              },
                            }}
                            onClick={() => handleEdit(subject.id)}
                          >
                            <EditIcon />
                          </IconButton>
                        ) : (
                          <Button
                            variant="contained"
                            startIcon={<EditIcon />}
                            onClick={() => handleEdit(subject.id)}
                          >
                            <Typography variant="body1">แก้ไข</Typography>
                          </Button>
                        )}
                      </td>
                      <td>
                        {tabletQuery ? (
                          <IconButton
                            sx={{
                              backgroundColor: "rgb(255, 87, 51)",
                              color: "white",
                              "&:hover": {
                                backgroundColor: "rgb(255, 87, 51)",
                              },
                            }}
                            onClick={() => handleDeleteClick(subject.id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        ) : (
                          <Button
                            variant="contained"
                            color="error"
                            startIcon={<DeleteIcon />}
                            onClick={() => handleDeleteClick(subject.id)}
                          >
                            <Typography variant="body1">ลบ</Typography>
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3">No subjects found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {lineChartData.length > 0 && (
          <div style={{ width: "100%", marginTop: 40 }}>
            <Typography variant="h6">
              คะแนนแบบทดสอบก่อนเรียน / หลังเรียน
            </Typography>
            <LineChart
              width={isXs ? 300 : isSm ? 600 : 800}
              height={isXs ? 300 : isSm ? 400 : 600}
              xAxis={[
                { data: lineChartData.map((d) => d.x), scaleType: "band" },
              ]}
              yAxis={[
                {
                  id: "linear",
                  scaleType: "linear",
                  position: "left",
                  min: 0,
                  max: maxY,
                },
              ]}
              series={[
                {
                  yAxisId: "linear",
                  data: lineChartData.map((d) => d.pretest),
                  label: "แบบทดสอบก่อนเรียน",
                },
                {
                  yAxisId: "linear",
                  data: lineChartData.map((d) => d.posttest),
                  label: "แบบทดสอบหลังเรียน",
                },
              ]}
            />

            <TableContainer component={Paper} sx={{ mt: 4 }}>
              <Table sx={{ minWidth: 650 }} aria-label="score summary table">
              {(() => {
                const maxPre = Math.max(...lineChartData.map((d) => d.pretest));
                const maxPreUser = lineChartData.find((d) => d.pretest === maxPre)?.x;
                const maxPost = Math.max(...lineChartData.map((d) => d.posttest));
                const maxPostUser = lineChartData.find((d) => d.posttest === maxPost)?.x;
                const minPre = Math.min(...lineChartData.map((d) => d.pretest));
                const minPreUser = lineChartData.find((d) => d.pretest === minPre)?.x;
                const minPost = Math.min(...lineChartData.map((d) => d.posttest));
                const minPostUser = lineChartData.find((d) => d.posttest === minPost)?.x;

                return (
                  <>
                    <TableHead>
                      <TableRow>
                        <TableCell />
                        <TableCell align="left" sx={{ fontWeight: 'bold', color: '#1976d2' }}>แบบทดสอบก่อนเรียน</TableCell>
                        <TableCell align="left" sx={{ fontWeight: 'bold', color: '#2e7d32' }}>แบบทดสอบหลังเรียน</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow>
                        <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>คะแนนสูงสุด</TableCell>
                        <TableCell align="left">{maxPreUser} ({maxPre} คะแนน)</TableCell>
                        <TableCell align="left">{maxPostUser} ({maxPost} คะแนน)</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>คะแนนต่ำสุด</TableCell>
                        <TableCell align="left">{minPreUser} ({minPre} คะแนน)</TableCell>
                        <TableCell align="left">{minPostUser} ({minPost} คะแนน)</TableCell>
                      </TableRow>
                    </TableBody>
                  </>
                );
              })()}
              </Table>
            </TableContainer>
          </div>
        )}
      </div>

      <div
        className={style["add-button"]}
        onClick={() => setSubjectPopupOpen(true)}
      >
        <img alt="Add button" src="/My_Coursesp/Add.svg" />
        <p>เพิ่มบทเรียนใหม่</p>
      </div>

      <Dialog
        open={subjectPopupOpen}
        onClose={() => setSubjectPopupOpen(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        slotProps={{
          paper: {
            sx: {
              borderRadius: "12px",
              padding: "20px",
              boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
              backgroundColor: "white",
            },
          },
        }}
      >
        <DialogTitle id="alert-dialog-title">
          คุณต้องการเพิ่มบทเรียนด้วยวิธีใด?
        </DialogTitle>

        <DialogActions>
          <Button
            variant="contained"
            onClick={() => {
              localStorage.setItem("prevMode", "pdf");
              navigate(`/add-subject/${courseId}/pdf`);
            }}
          >
            ไฟล์ PDF
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              localStorage.setItem("prevMode", "manual");
              navigate(`/add-subject/${courseId}/manual`);
            }}
          >
            กำหนดเอง
          </Button>
        </DialogActions>
      </Dialog>

      {fixCoursePopup && (
        <EditPopup
          courseInfo={data.courseInfo}
          onClose={() => setFixCoursePopup(false)}
          onSave={handleSaveCourse}
        />
      )}

      {editPopupOpen && (
        <SettingPopup
          courseInfo={data.courseInfo}
          subject={data.subject}
          count_questions={data.countQuestions}
          count_labs={data.countLabs}
          onClose={() => setEditPopupOpen(false)}
          onSave={handleSettingCourse}
        />
      )}

      {examDialogOpen && (
        <TestPopup
          examDialogOpen={examDialogOpen}
          setExamDialogOpen={setExamOpenDialog}
        />
      )}

      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"ยืนยันการลบบทเรียน"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            คุณแน่ใจหรือไม่ว่าต้องการลบบทเรียนนี้? การกระทำนี้ไม่สามารถกู้คืนได้
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>ยกเลิก</Button>
          <Button onClick={handleConfirmDelete} color="error" autoFocus>
            ยืนยัน
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleSnackbarClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} variant="filled" sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
}

export default EditCourse;
