import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import backend from "../../../api/backend";
import { AuthContext } from "../../../context/AuthProvider";

import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { Button, Dialog, DialogActions, DialogTitle, IconButton, Stack, Typography, useMediaQuery } from "@mui/material";

import style from "./css/editcourse.module.css";
import EditPopup from "./EditPopup";
import { BarChart } from "@mui/x-charts";

function EditCourse() {
  const { courseId } = useParams();
  const { userData } = useContext(AuthContext);
  const [ data, setData ] = useState({
    courseInfo: {},
    subject: [],
  });
  const [ chartData, setChartData ] = useState(null);
  const [ editPopupOpen, setEditPopupOpen ] = useState(false);
  const [ subjectPopupOpen, setSubjectPopupOpen ] = useState(false);
  const navigate = useNavigate();

  const fetchSubjects = async () => {
    try {
      const response = await backend.get(`/subjects/getAllSubject/${courseId}`);

      if (response.status === 200) {
        setData({
          courseInfo: response.data.courseInfo,
          subject: response.data.subject,
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  const fetchProgressAnalysis = async () => {
    try{
      const response = await backend.get(`/teacher/progressAnalysis/${courseId}`,{
        withCredentials: true
      });

        if(response.status === 200){
          const data = response.data;
          setChartData({
            dataset: [{
              test: "Summary",
              Prevalue: Number(data.averagePrePercent),
              Postvalue: Number(data.averagePostPercent),
              Growthvalue: Number(data.averageGrowth),
            }],
            maxPreScore: data.maxPreScore,
            maxPostScore: data.maxPostScore,
            minPreScore: data.minPreScore,
            minPostScore: data.minPostScore,
            userCount: data.userCount,
          });
        }
    } catch(error) {
      console.log(error);
    }
  }
  
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
    const confirmDelete = window.confirm( "Are you sure you want to delete this subject?" );
    if (!confirmDelete) return;

    try {
      const response = await backend.delete(`/teacher/deleteSubjectOnCourse/${courseId}/${subjectId}/${userData.id}`, {
        withCredentials: true
      });
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

  const tabletQuery = useMediaQuery('(max-width:720px)');
  const isXs = useMediaQuery("(max-width:600px)");
  const isSm = useMediaQuery("(max-width:900px)");

  return (
    <div className={style.pageWrapper}>
      <div className={style.container}>
        <div className={style.head}>
          <div className={style["info-wrapper"]}>
            <img alt="course icon" src={data.courseInfo.icon} 
              style={{
                "width": "50px", 
                "height": "50px", 
                "borderRadius": "8px"
              }}/>
            <h2>{data.courseInfo.name}</h2>
            <IconButton onClick={() => setEditPopupOpen(true)}>
              <EditIcon/>
            </IconButton>
          </div>
          
          <Button 
            variant="contained"
            sx={{
              width: { xs: "100%", sm: "25%" }
            }}
            onClick={() => navigate(`/enrollment-summary/${courseId}`)}
          >
            รายชื่อผู้เรียน
          </Button>
        </div>

        <div className={style.body}>
          <div className={style.tableWrapper}>
            <table className={style.subjectTable}>
              <thead>
                <tr>
                  <th>บทเรียน</th>
                  <th>แก้ไข</th>
                  <th>ลบ</th>
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
                            <EditIcon/>
                          </IconButton>
                        ) : (
                          <Button
                            variant="contained"
                            startIcon={<EditIcon/>}
                            onClick={() => handleEdit(subject.id)}
                          >
                            <Typography variant="body1">Edit</Typography>
                            
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
                            <DeleteIcon/>
                          </IconButton>
                        ) : (
                          <Button
                            variant="contained"
                            color="error"
                            startIcon={<DeleteIcon/>}
                            onClick={() => handleDelete(subject.id)}
                          >
                            <Typography variant="body1">Delete</Typography>
                            
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

        {chartData && (
          <div style={{ width: "100%", marginTop: "40px" }}>
            <Typography variant="h6" gutterBottom>
              สรุปผล Pretest / Posttest / Growth
            </Typography>

            <BarChart
              width={isXs ? 300 : isSm ? 600 : 800}
              height={isXs ? 300 : isSm ? 400 : 600}
              dataset={chartData.dataset}
              xAxis={[{ 
                dataKey: "test", 
                label: "ประเภทการทดสอบ",
                scaleType: 'band' 
              }]}
              yAxis={[{ 
                dataKey: "value", 
                label: "เปอร์เซ็นต์ (%)", 
                min: 0, 
                max: 100 
              }]}
              series={[
                { dataKey: "Prevalue", label: "Pretest", color: '#1976d2' },
                { dataKey: "Postvalue", label: "Posttest", color: '#2e7d32' },
                { dataKey: "Growthvalue", label: "Growth", color: '#ff5722' },
              ]}
            />

            <Stack 
              direction={{ xs: "column", sm: "row" }} 
              spacing={4} 
              mt={3}
              justifyContent="flex-start"
              alignItems={{ xs: "flex-start", sm: "center" }}
            >
              <Typography>
                <span style={{ color: "#1976d2", fontWeight: "bold" }}>แบบทดสอบก่อนเรียน:</span> ต่ำสุด {chartData.minPreScore}, สูงสุด {chartData.maxPreScore}
              </Typography>
              <Typography>
                <span style={{ color: "#2e7d32", fontWeight: "bold" }}>แบบทดสอบหลังเรียน:</span> ต่ำสุด {chartData.minPostScore}, สูงสุด {chartData.maxPostScore}
              </Typography>
              <Typography>
                <span style={{ color: "#ff5722", fontWeight: "bold" }}>นักเรียนทั้งหมด:</span> {chartData.userCount}
              </Typography>
            </Stack>
          </div>
        )}

      </div>

      <div className={style["add-button"]} onClick={() => setSubjectPopupOpen(true)}>
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
              borderRadius: '12px',
              padding: '20px',
              boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
              backgroundColor: 'white',
            }
          }
        }}
      >
        <DialogTitle id="alert-dialog-title">
          คุณต้องการเพิ่มบทเรียนด้วยวิธีใด?
        </DialogTitle>

        <DialogActions>
          <Button 
            variant='contained' 
            onClick={() => {
              localStorage.setItem("prevMode", "pdf");
              navigate(`/add-subject/${courseId}/pdf`);
            }}
          >
            ไฟล์ PDF
          </Button>
          <Button 
            variant='contained' 
            onClick={() => {
              localStorage.setItem("prevMode", "manual");
              navigate(`/add-subject/${courseId}/manual`)
            }}
          >
            กำหนดเอง
          </Button>
        </DialogActions>
      </Dialog>

      {editPopupOpen && (
        <EditPopup
          courseInfo={data.courseInfo}
          onClose={() => setEditPopupOpen(false)}
          onSave={handleSaveCourse}
        />
      )}
    </div>
  );
}

export default EditCourse;
