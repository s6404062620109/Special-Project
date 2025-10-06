import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import backend from "../../../api/backend";
import { AuthContext } from "../../../context/AuthProvider";

import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  Button,
  Dialog,
  DialogActions,
  DialogTitle,
  IconButton,
  Stack,
  Typography,
  useMediaQuery,
} from "@mui/material";

import style from "./css/editcourse.module.css";
import EditPopup from "./EditPopup";
import { LineChart } from "@mui/x-charts";
import TestPopup from "./TestPopup";

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
  const [ subjectPopupOpen, setSubjectPopupOpen ] = useState(false);
  const [ examDialogOpen, setExamOpenDialog ] = useState(false);
  const navigate = useNavigate();

  const fetchSubjects = async () => {
    try {
      const response = await backend.get(`/subjects/getAllSubject/${courseId}`);

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
        console.log(response.data);
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

  const handleDelete = async (subjectId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this subject?"
    );
    if (!confirmDelete) return;

    try {
      const response = await backend.delete(
        `/teacher/deleteSubjectOnCourse/${courseId}/${subjectId}/${userData.id}`,
        {
          withCredentials: true,
        }
      );
      if (response.status === 200) {
        alert(response.data.message);
        setData((prevData) => ({
          ...prevData,
          subject: prevData.subject.filter(
            (subject) => subject.id !== subjectId
          ),
        }));
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleSaveCourse = () => {
    setEditPopupOpen(false);
    fetchSubjects();
  };

  const tabletQuery = useMediaQuery("(max-width:720px)");
  const isXs = useMediaQuery("(max-width:600px)");
  const isSm = useMediaQuery("(max-width:900px)");

  const lineChartData = chartData?.users?.map((u) => {
      const duplicateCount = chartData.users.filter(
        (user) => user.name === u.name
      ).length;
      const nameWithId = duplicateCount > 1 ? `${u.name}-${u.userId}` : u.name;

      return {
        userId: u.id,
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
    10
  );
  
  return (
    <div className={style.pageWrapper}>
      <div className={style.container}>
        <div className={style.head}>
          <div className={style["info-wrapper"]}>
            <img
              alt="course icon"
              src={data.courseInfo.icon}
              style={{
                width: "50px",
                height: "50px",
                borderRadius: "8px",
              }}
            />
            <h2>{data.courseInfo.name}</h2>
            <IconButton onClick={() => setEditPopupOpen(true)}>
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
          </Stack>
          
        </div>

        <div className={style.body}>

          <div className={style.tableWrapper}>
            <table className={style.subjectTable}>
              <thead>
                <tr>
                  <th>บทเรียน</th>
                  <th colSpan={3}></th>
                </tr>
              </thead>
              <tbody>
                {data.subject.length > 0 ? (
                  data.subject.map((subject) => (
                    <tr key={subject.id}>
                      <td>{subject.name}</td>
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
                            onClick={() => handleDelete(subject.id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        ) : (
                          <Button
                            variant="contained"
                            color="error"
                            startIcon={<DeleteIcon />}
                            onClick={() => handleDelete(subject.id)}
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

            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={4}
              mt={2}
              justifyContent="flex-start"
              alignItems={{ xs: "flex-start", sm: "center" }}
            >
              {(() => {
                const maxPre = Math.max(...lineChartData.map((d) => d.pretest));
                const maxPreUser = lineChartData.find(
                  (d) => d.pretest === maxPre
                )?.x;
                const maxPost = Math.max(
                  ...lineChartData.map((d) => d.posttest)
                );
                const maxPostUser = lineChartData.find(
                  (d) => d.posttest === maxPost
                )?.x;

                return (
                  <>
                    <Typography>
                      <span style={{ fontWeight: "bold", color: "#1976d2" }}>
                        คะแนนสูงสุดแบบทดสอบก่อนเรียน:
                      </span>{" "}
                      {maxPreUser} {maxPre} คะแนน
                    </Typography>
                    <Typography>
                      <span style={{ fontWeight: "bold", color: "#2e7d32" }}>
                        คะแนนสูงสุดแบบทดสอบหลังเรียน:
                      </span>{" "}
                      {maxPostUser} {maxPost} คะแนน
                    </Typography>
                  </>
                );
              })()}
            </Stack>

            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={4}
              mt={2}
              justifyContent="flex-start"
              alignItems={{ xs: "flex-start", sm: "center" }}
            >
              {(() => {
                const minPre = Math.min(...lineChartData.map((d) => d.pretest));
                const minPreUser = lineChartData.find(
                  (d) => d.pretest === minPre
                )?.x;
                const minPost = Math.min(
                  ...lineChartData.map((d) => d.posttest)
                );
                const minPostUser = lineChartData.find(
                  (d) => d.posttest === minPost
                )?.x;
                return (
                  <>
                    <Typography>
                      <span style={{ fontWeight: "bold", color: "#1976d2" }}>
                        คะแนนต่ำสุดแบบทดสอบก่อนเรียน:
                      </span>{" "}
                      {minPreUser} {minPre} คะแนน
                    </Typography>
                    <Typography>
                      <span style={{ fontWeight: "bold", color: "#2e7d32" }}>
                        คะแนนต่ำสุดแบบทดสอบหลังเรียน:
                      </span>{" "}
                      {minPostUser} {minPost} คะแนน
                    </Typography>
                  </>
                );
              })()}
            </Stack>
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

      {editPopupOpen && (
        <EditPopup
          courseInfo={data.courseInfo}
          subject={data.subject}
          count_questions={data.countQuestions}
          count_labs={data.countLabs}
          onClose={() => setEditPopupOpen(false)}
          onSave={handleSaveCourse}
        />
      )}

      {examDialogOpen && (
        <TestPopup
          examDialogOpen={examDialogOpen}
          setExamDialogOpen={setExamOpenDialog}
        />
      )}
    </div>
  );
}

export default EditCourse;
