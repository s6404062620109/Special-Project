import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import backend from "../../../api/backend";
import { AuthContext } from "../../../context/AuthProvider";

import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { Button, Dialog, DialogActions, DialogTitle, IconButton, Stack, Typography, useMediaQuery } from "@mui/material";
import { PieChart } from '@mui/x-charts/PieChart';

import style from "./css/editcourse.module.css";
import EditPopup from "./EditPopup";

function EditCourse() {
  const { courseId } = useParams();
  const { userData } = useContext(AuthContext);
  const [ data, setData ] = useState({
    courseInfo: {},
    subject: [],
  });
  const [ chartData, setChartData ] = useState({
    Pretest_pass: [],
    Posttest_pass: [],
    Pretest_fail: [],
    Posttest_fail: []
  });
  const [ editPopupOpen, setEditPopupOpen ] = useState(false);
  const [ subjectPopupOpen, setSubjectPopupOpen ] = useState(false);
  const navigate = useNavigate();

  const fetchSubjects = async () => {
    try {
      const response = await backend.get(`/subjects/getAllSubject/${courseId}`);

      if (response.status === 200) {
        setData({
          courseInfo: response.data.courseInfo[0],
          subject: response.data.subject,
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  const fetchCourseTestInfo = async () => {
    try {
      const response = await backend.get(`/teacher/courseTestProgress/${courseId}`, {
        withCredentials: true
      });

      if (response.status === 200) {
        const rawCounts = {
          Pretest_pass: {},
          Pretest_fail: {},
          Posttest_pass: {},
          Posttest_fail: {}
        };

        response.data.forEach(item => {
          if (item.is_completed === 1) {
            const subjectId = item.subjectId;
            const score = item.score;

            if (item.type.includes('Pre')) {
              if (score === 0) {
                rawCounts.Pretest_fail[subjectId] = (rawCounts.Pretest_fail[subjectId] || 0) + 1;
              } else {
                rawCounts.Pretest_pass[subjectId] = (rawCounts.Pretest_pass[subjectId] || 0) + 1;
              }
            }

            if (item.type.includes('Post')) {
              if (score === 0) {
                rawCounts.Posttest_fail[subjectId] = (rawCounts.Posttest_fail[subjectId] || 0) + 1;
              } else {
                rawCounts.Posttest_pass[subjectId] = (rawCounts.Posttest_pass[subjectId] || 0) + 1;
              }
            }
          }
        });

        const subjectMap = {};
        data.subject.forEach(sub => {
          subjectMap[sub.id] = sub.name;
        });

        const buildList = (obj) =>
          Object.entries(obj).map(([subjectId, counter]) => ({
            subjectId: parseInt(subjectId),
            subjectName: subjectMap[subjectId],
            counter
          }));

        const formatted = {
          Pretest_pass: buildList(rawCounts.Pretest_pass),
          Pretest_fail: buildList(rawCounts.Pretest_fail),
          Posttest_pass: buildList(rawCounts.Posttest_pass),
          Posttest_fail: buildList(rawCounts.Posttest_fail),
        };

        setChartData(formatted);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
  fetchSubjects();
  }, [courseId]);

  useEffect(() => {
    if (data.subject.length > 0) {
      fetchCourseTestInfo();
    }
  }, [data.subject]);

  const handleEdit = (subjectId) => {
    navigate(`/edit-subject/${courseId}/${subjectId}`);
  };

  const handleDelete = async (subjectId) => {
    const confirmDelete = window.confirm( "Are you sure you want to delete this subject?" );
    if (!confirmDelete) return;

    try {
      const response = await backend.delete(`/teacher/deleteSubjectOnCourse/${courseId}/${subjectId}/${userData.id}`);
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

  return (
    <div className={style.pageWrapper}>
      <div className={style.container}>
        <div className={style.head}>
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

        <div className={style.body}>
          <div className={style.tableWrapper}>
            <table className={style.subjectTable}>
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

        <div className={style.footer}>
          <Typography variant="h5">ผลการทดสอบคอร์สเรียน</Typography>
          <Stack
            direction={ tabletQuery ? "column" : "row"}
            justifyContent="space-around"
            alignItems="center"
            gap={2}
            sx={{ flexWrap: 'wrap', width: '100%' }}
          > 
            <Stack
              direction="column"
              spacing={2}
            >
              <Typography variant="h6">รายวิชาที่สอบผ่าน</Typography>

              { (chartData.Pretest_pass.length + chartData.Pretest_fail.length) > 0 ? (
                <PieChart
                  series={[
                    {
                      data: [
                        ...chartData.Pretest_pass.map(item => ({
                          id: `${item.subjectId}`,
                          value: item.counter,
                          label: `${item.subjectName}`
                        })),
                      ]
                    }
                  ]}
                  width={200}
                  height={200}
                /> ) : (
                  <Typography variant="h6">ไม่มีข้อมูล</Typography>
                )
              }
            </Stack>
            
            <Stack
              direction="column"
              spacing={2}
            >
              <Typography variant="h6">รายวิชาที่สอบไม่ผ่าน</Typography>

              { (chartData.Pretest_pass.length + chartData.Pretest_fail.length) > 0 ? (
                <PieChart
                  series={[
                    {
                      data: [
                        ...chartData.Pretest_fail.map(item => ({
                          id: `fail-${item.subjectId}`,
                          value: item.counter,
                          label: `${item.subjectName} (Fail)`
                        }))
                      ]
                    }
                  ]}
                  width={200}
                  height={200}
                /> ) : (
                  <Typography variant="h6">ไม่มีข้อมูล</Typography>
                )
              }
            </Stack>
          </Stack>
          
        </div>
      </div>

      <div className={style["add-button"]} onClick={() => setSubjectPopupOpen(true)}>
        <img alt="Add button" src="/My_Coursesp/Add.svg" />
        <p>Add Subject</p>
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
          {"How to add subject?"}
        </DialogTitle>

        <DialogActions>
          <Button 
            variant='contained' 
            onClick={() => {
              localStorage.setItem("prevMode", "pdf");
              navigate(`/add-subject/${courseId}/pdf`);
            }}
          >
            PDF
          </Button>
          <Button 
            variant='contained' 
            onClick={() => {
              localStorage.setItem("prevMode", "manual");
              navigate(`/add-subject/${courseId}/manual`)
            }}
          >
            Manual
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
