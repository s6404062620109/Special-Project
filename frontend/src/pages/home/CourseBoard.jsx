import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import backend from '../../api/backend';
import { AuthContext } from '../../context/AuthProvider';

import style from './css/courseboard.module.css';
import { Button, Typography } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';

function CourseBoard({ enrollment }) {
    const [courses, setCourses] = useState([]);
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
                            ...latestEnroll,
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

    const handleEnroll = async (courseId) => {
        try {
            const response = await backend.post(`/enroll/enrollCourse`, {
                courseId: courseId,
                userId: userData.id,
            }, { withCredentials: true });

            if (response.status === 200) {
                navigate(`/course/${courseId}/pretest/${response.data.enrollmentId}`);
            }
        } catch (error) {
            console.log(error);
        }
    };

    const handleContinue = async (enrollmentId, courseId) => {
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

    // กรองคอร์สที่ยังเรียนไม่จบ (กำลังเรียนอยู่ หรือ เรียนไม่ผ่าน)
    const activeCourses = courses.filter(course => course.posttest_complete === 0 || course.posttest_complete === -1);

    // กรองคอร์สที่เรียนจบแล้ว
    const completedCourses = courses.filter(course => course.posttest_complete === 1);

    // รวม list โดยให้คอร์สที่เรียนอยู่ขึ้นก่อน
    const sortedCourses = [...activeCourses, ...completedCourses];

    return (
        <div className={style.CourseBoard}>
            <div className={style.head}>
                <Typography variant='h6'>คอร์สที่เรียนอยู่</Typography>
            </div>

            {courses.length > 0 ? (
                <div className={style.body}>
                    <table>
                        <tbody>
                            {sortedCourses.map((course, index) => (
                                <tr key={index} onClick={() => navigate(`/course/${course.courseId}/${course.id}`)}> 
                                    <td>
                                        <img
                                            src={course.icon}
                                            alt="Course Icon"
                                            width="50"
                                            height="50"
                                        />

                                        <p>{course.name}</p>
                                    </td>

                                    <td>
                                        {course.posttest_complete === 0 && (
                                            <Button variant="contained" onClick={(e) => { e.stopPropagation(); handleContinue(course.id, course.courseId); }}>
                                                เข้าเรียนต่อ
                                            </Button>
                                        )}
                                        {course.posttest_complete === -1 && (
                                            <Button variant="contained" color="warning" onClick={(e) => { e.stopPropagation(); handleEnroll(course.courseId); }}>
                                                สมัครเรียนใหม่
                                            </Button>
                                        )}
                                        {course.posttest_complete === 1 && (
                                            <Typography variant="subtitle1" align="center" color="green" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                สำเร็จการเรียน
                                                <CheckIcon color="success" sx={{ ml: 1 }} />
                                            </Typography>
                                        )}
                                    </td>
                                    
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className={style.body}>
                    <Typography variant='body1'>ไม่มีคอร์สที่เรียนอยู่</Typography>
                </div>
            )}
        </div>
    );
}

export default CourseBoard;