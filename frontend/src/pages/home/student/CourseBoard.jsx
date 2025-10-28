import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import backend from '../../../api/backend';
import { AuthContext } from '../../../context/AuthProvider';

import style from './courseboard.module.css';
import { Avatar, Button, Pagination, Stack, Typography } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import SchoolIcon from '@mui/icons-material/School';
import CourseCard from '../../../components/CourseCard';

function CourseBoard({ enrollment }) {
    const [ courses, setCourses ] = useState([]);
    const [ currentPage, setCurrentPage ] = useState(1);
    const { userData } = useContext(AuthContext);
    const navigate = useNavigate();

    const fetchCourses = async () => {
        if (enrollment.length > 0) {
            const courseIds = enrollment.map((enroll) => enroll.courseId);

            try {
                const response = await backend.get(`/courses/getEnrollmentCourses/${courseIds.join(',')}`);

                if (response.status === 200) {
                    const combinedData = response.data.map((course) => {
                        const courseEnrollments = enrollment.filter((enroll) => enroll.courseId === course.id);
                        const latestEnroll = courseEnrollments.at(-1);
                        return {
                        ...course,
                            enrollmentId: latestEnroll.id,
                            posttest_complete: latestEnroll.posttest_complete,
                        };
                    });
                    setCourses(combinedData);
                }
            } catch (error) {
                console.error("Error fetching course data:", error);
            }
        }
    };

    useEffect(() => {
        fetchCourses();
    }, [enrollment]);

    // กรองคอร์สที่ยังเรียนไม่จบ (กำลังเรียนอยู่ หรือ เรียนไม่ผ่าน)
    const activeCourses = courses.filter(course => course.posttest_complete === 0 || course.posttest_complete === -1);

    // กรองคอร์สที่เรียนจบแล้ว
    const completedCourses = courses.filter(course => course.posttest_complete === 1);

    // รวม list โดยให้คอร์สที่เรียนอยู่ขึ้นก่อน
    const sortedCourses = [...activeCourses, ...completedCourses];

    // Pagination Logic
    const coursesPerPage = 4;
    const pageCount = Math.ceil(sortedCourses.length / coursesPerPage);
    const indexOfLastCourse = currentPage * coursesPerPage;
    const indexOfFirstCourse = indexOfLastCourse - coursesPerPage;
    const currentCourses = sortedCourses.slice(indexOfFirstCourse, indexOfLastCourse);

    const handlePageChange = (event, value) => {
        setCurrentPage(value);
        window.scrollTo(0, 0);
    };

    return (
        <div className={style.CourseBoard}>
            <div className={style.head}>
                <Typography variant='h6'>คอร์สที่เรียนอยู่</Typography>
                <Button 
                    variant="outlined" 
                    onClick={() => navigate('/courses')}
                    sx={{ alignSelf: 'flex-end' }}
                >
                    ดูคอร์สทั้งหมด
                </Button>
            </div>

            {courses.length > 0 ? (
                <Stack 
                    gap={2}
                    sx={{
                        width: "100%",
                        margin: "16px auto",
                    }}
                >
                    {currentCourses.map((course, index) => (
                        <CourseCard
                            key={index}
                            course={course}
                            onClick={() => navigate(`/course/${course.id}/${course.enrollmentId}`)}
                        />
                    ))}

                    {pageCount > 1 && (
                        <Stack 
                            sx={{ 
                                width: "100%",
                                mt: 2 
                            }}
                        >
                            <Pagination
                                count={pageCount}
                                page={currentPage}
                                onChange={handlePageChange}
                                color="primary"
                                sx={{ display: 'flex', justifyContent: 'center' }}
                            />
                        </Stack>
                    )}
                </Stack>
            ) : (
                <>
                    <Typography variant='body1'>ไม่มีคอร์สที่เรียนอยู่</Typography>
                </>
            )}
        </div>
    );
}

export default CourseBoard;