import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import backend from '../../api/backend';
import Processbar from '../courses/Processbar';

import style from './css/courseboard.module.css';
import { Typography } from '@mui/material';

function CourseBoard({ enrollment }) {
    const [courses, setCourses] = useState([]);
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

    return (
        <div className={style.CourseBoard}>
            <div className={style.head}>
                <Typography variant='h6'>คอร์สที่เรียนอยู่</Typography>
            </div>

            {courses.length > 0 ? (
                <div className={style.body}>
                    <table>
                        <tbody>
                            {courses.map((course, index) => (
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
                                        <p>{course.name}</p>
                                        <Processbar
                                            pretest_complete={course.pretest_complete}
                                            posttest_complete={course.posttest_complete}
                                            completed_labs={course.completed_labs}
                                            total_labs={course.total_labs}
                                        />
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