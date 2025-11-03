import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthProvider";
import backend from "../../api/backend";
import Login from "../authenticate/login";
import CourseBoard from "./student/CourseBoard";
import CourseCard from "../../components/CourseCard";

import style from "./css/home.module.css";
import { Button, Grid, Stack, Typography, useMediaQuery } from "@mui/material";

function Home() {
  const { userData } = useContext(AuthContext);
  const [ enrollment, setEnrollment ] = useState([]);
  const [ publicCourses, setPublicCourses ] = useState([]);
  const navigate = useNavigate();

  const fetchEnrollment = async () => {
    try {
      const response = await backend.get(`/enroll/checkCoursesEnroll/${userData.id}`, {
        withCredentials: true,
      });
      if (response.status === 200) {
        const latestEnrollmentsMap = new Map();
        response.data.results.forEach(enrollment => {
          const existing = latestEnrollmentsMap.get(enrollment.courseId);
          if (!existing || enrollment.id > existing.id) {
            latestEnrollmentsMap.set(enrollment.courseId, enrollment);
          }
        });

        const uniqueLatestEnrollments = Array.from(latestEnrollmentsMap.values());
        setEnrollment(uniqueLatestEnrollments);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const fetchPublicCourses = async () => {
    try {
      const response = await backend.get('/courses/top');
      if (response.status === 200) {
        setPublicCourses(response.data.results);
      }
    } catch (error) {
      console.log("Error fetching public courses:", error);
    }
  };

  useEffect(() => {
    if (userData.id && userData.role === "s") {
      fetchEnrollment();
    }

    if (!userData.id) {
      fetchPublicCourses();
    }
  }, [userData.id]);

  const isXs = useMediaQuery("(max-width:600px)"); 

  return (
    <div className={style.pageWrapper}>
      <div className={style.container}>

        {!userData.id && (
          <div className={style["container-wrap"]}>
            <div className={style.content}>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="center"
                sx={{
                  backgroundColor: "#fcfcfcff",
                  gap: 2,
                  p: { xs: "16px 0", md: 4 },
                  borderRadius: 4,
                  boxShadow: '4px 4px 6px rgba(0,0,0,0.08)',
                  mb: 4,
                  width: { xs: "100%", md: "80%" },
                  margin: "0 auto"
                }}
              >
                <img 
                  alt='Logo Image' 
                  src='/Navbar_Assets/Logo.svg'
                  style={{
                    width: 80,
                    height: 80
                  }}
                />

                <Stack
                  direction="column"
                  gap={2}
                  sx={{
                    alignItems: { xs: "center", md: "flex-start" }
                  }}
                >
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    Security Awareness Training
                  </Typography>

                  {!isXs && (
                    <Typography 
                      variant="subtitle1" 
                      color="text.secondary"
                    >
                      การอบรมเพื่อสร้างความรู้และความตระหนักรู้เกี่ยวกับความปลอดภัยทาง
                      ไซเบอร์ให้กับบุคลากรในองค์กรโดยเน้นให้เข้าใจถึงภัยคุกคามที่อาจเกิดขึ้น
                    </Typography>
                  )}
                </Stack>
                
              </Stack>

              {publicCourses.length > 0 && (
                <Stack 
                  spacing={2} 
                  sx={{ 
                    width: { xs: "100%", md: "80%" },
                    margin: "0 auto" 
                  }}
                >
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                  >
                    <Typography variant="h6">คอร์สยอดนิยม</Typography>
                    <Button 
                      variant="outlined" 
                      onClick={() => navigate('/courses')}
                      sx={{ alignSelf: 'flex-end' }}
                    >
                      ดูคอร์สทั้งหมด
                    </Button>
                  </Stack>
                  
                  <Stack 
                    direction="column" 
                    gap={2}
                    sx={{ 
                      margin: "0 auto" 
                    }}
                  >
                    {publicCourses.slice(0, 3).map((course) => (
                        <CourseCard
                          course={course}
                          onClick={() => navigate(`/course/${course.id}`)}
                        />
                    ))}
                  </Stack>
                </Stack>
              )}
            </div>
          </div>
        )}

        {userData.id && userData.role === "s" && (
          <div className={style["container-wrap"]}>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="center"
                sx={{
                  backgroundColor: "#fcfcfcff",
                  gap: 2,
                  p: { xs: "16px 0", md: 4 },
                  borderRadius: 4,
                  boxShadow: '4px 4px 6px rgba(0,0,0,0.08)',
                  mb: 4,
                  width: { xs: "100%", md: "90%" },
                  margin: "0 auto"
                }}
              >
                <img 
                  alt='Logo Image' 
                  src='/Navbar_Assets/Logo.svg'
                  style={{
                    width: 80,
                    height: 80
                  }}
                />

                <Stack
                  direction="column"
                  gap={2}
                  sx={{
                    alignItems: { xs: "center", md: "flex-start" }
                  }}
                >
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    Security Awareness Training
                  </Typography>

                  {!isXs && (
                    <Typography 
                      variant="subtitle1" 
                      color="text.secondary"
                    >
                      การอบรมเพื่อสร้างความรู้และความตระหนักรู้เกี่ยวกับความปลอดภัยทาง
                      ไซเบอร์ให้กับบุคลากรในองค์กรโดยเน้นให้เข้าใจถึงภัยคุกคามที่อาจเกิดขึ้น
                    </Typography>
                  )}
                </Stack>
                
              </Stack>
            <CourseBoard enrollment={enrollment} />
          </div>
        )}

        {userData.id && userData.role === "t" && (
          <div className={style["container-wrap"]}>
            <div className={style.content}>
              <Typography variant="h1">
                Security <br /> Awareness Training <br /> For Teacher.
              </Typography>
            </div>
          </div>
        )}

        {userData.id && userData.role === "a" && (
          <div className={style["container-wrap"]}>
            <div className={style.content}>
              <Typography variant="h1">
                Security <br /> Awareness Training <br /> For Admin.
              </Typography>
            </div>
          </div>
        )}
      </div>
      
    </div>
  );
}

export default Home;
