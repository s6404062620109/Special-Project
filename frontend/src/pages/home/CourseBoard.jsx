import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import backend from '../../api/backend';
import Processbar from '../courses/Processbar';

import style from './css/courseboard.module.css';

function CourseBoard({ enrollment }) {
    const [courses, setCourses] = useState([]);
    const [imgPaths, setImgPaths] = useState({});
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCourses = async () => {
            if (enrollment.length > 0) {
                const courseIds = enrollment.map((enroll) => enroll.courseId);

                try {
                    const response = await backend.get(`/courses/getEnrollmentCourses/${courseIds.join(',')}`);

                    if (response.status === 200) {
                        const combinedData = response.data.map((course) => {
                            const enrollData = enrollment.find((enroll) => enroll.courseId === course.id);
                            return {
                                ...course,
                                ...enrollData,
                            };
                        });

                        setCourses(combinedData);
                        
                        combinedData.forEach((course) => {
                            fetchIcon(course.courseId, course.icon_id);
                        });
                    }
                } catch (error) {
                    console.error("Error fetching course data:", error);
                }
            }
        };

        const fetchIcon = async (courseId, iconId) => {
            try {
                const response = await backend.get(`/imgrender/getIcon/${courseId}/${iconId}`);
                if (response.status === 200) {
                    const imageUrl = `${import.meta.env.VITE_API_BASE_URL}${response.data.url}`;

                    setImgPaths((prevPaths) => ({
                        ...prevPaths, [courseId]: imageUrl,
                    }));
                }
            } catch (err) {
                console.error("Error fetching icon:", err);
            }
        };

        fetchCourses();
    }, [enrollment]);

    return (
        <div className={style.CourseBoard}>
            <div className={style.head}>
                <p>COURSES</p>
            </div>

            {courses.length > 0 ? (
                <div className={style.body}>
                    <table>
                        <tbody>
                            {courses.map((course, index) => (
                                <tr key={index}> 
                                    <td>
                                        {imgPaths[course.courseId] ? (
                                            <img
                                                src={imgPaths[course.courseId]}
                                                alt="Course Icon"
                                                width="50"
                                                height="50"
                                            />
                                        ) : (
                                            <p>Loading icon...</p>
                                        )}

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

                                    <td>
                                        <button onClick={() => navigate(`/course/${course.courseId}/${course.id}`)}>
                                            View
                                        </button>
                                    </td>
                                    
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className={style.body}>Not found course enrollment.</div>
            )}
        </div>
    );
}

export default CourseBoard;