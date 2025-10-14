import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Processbar from "./Processbar";
import backend from "../../api/backend";
import { AuthContext } from "../../context/AuthProvider";

import style from "./css/coursedata.module.css";
import { Button, Typography } from "@mui/material";
import CheckIcon from '@mui/icons-material/Check';


function CourseData({ id, name, icon, enrollmentId, courseId }) {
  const { userData } = useContext(AuthContext);
  const [ buttonText, setButtonText ] = useState("");
  const [ history, setHistory ] = useState([]);
  const navigate = useNavigate();

  const fetchHistory = async () => {
    try {
      const response = await backend.get(`/enroll/checkCoursesEnroll/${userData.id}`, {withCredentials: true});
      
      if (response.status === 200) {
        setHistory(response.data.results);
      }
    } catch (err) {
      console.log(err);
    }
  };

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

  const enrollCourse = async () => {
    try {
      const response = await backend.post(`/enroll/enrollCourse`, {
        courseId: id,
        userId: userData.id,
      }, {withCredentials: true});

      if (response.status === 200) {
        navigate(`/course/${id}/pretest/${response.data.enrollmentId}`);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleClick = (status) => {
    if (status === "เข้าเรียนต่อ") {
      fetchLatestProgress();
    } 
    
    else if (status === "สมัครเรียนใหม่") {
      enrollCourse();
    } 
    
    else {
      navigate(`/course/${id}`);
    }
  };

  const filteredHistory = history.filter((enroll) => enroll.courseId === id);

  useEffect(() => {   
    fetchHistory();

    if (enrollmentId !== null) {
      setButtonText("เข้าเรียนต่อ");
    } else {
      setButtonText("สมัครเรียนใหม่");
    }

  }, [id, userData, enrollmentId]);

  return (
    <tr className={style.card}>
      <td className={style.content}>
        <div
          className={style["tcell-wrap"]}
          onClick={() => {
            if (userData.id) {
              navigate(`/course/${courseId}/${enrollmentId}`);
            } else {
              navigate(`/course/${courseId}`);
            }
          }}
        >
          <img alt="Icon Image" src={icon} />
          <p>{name}</p>
        </div>

        <div
          className={style["tcell-mobile-wrap"]}
          onClick={() => {
            if (userData.id) {
              navigate(`/course/${courseId}/${enrollmentId}`);
            } else {
              navigate(`/course/${courseId}`);
            }
          }}
        >
          <div>
            <img alt="Icon Image" src={icon} />
            <p>{name}</p>
          </div>         
          
        </div>
      </td>

      {/* {userData.id &&(
        <td>
          {filteredHistory.length > 0 ? (
            (() => {
              const latestEnroll = filteredHistory.at(-1);

              return (
                <Processbar
                  pretest_complete={latestEnroll.pretest_complete}
                  posttest_complete={latestEnroll.posttest_complete}
                  completed_labs={latestEnroll.completed_labs}
                  total_labs={latestEnroll.total_labs}
                />
              );
            })()
          ) : (
            <></>
          )}
        </td>
      )} */}
      
      <td>
        {filteredHistory.length > 0 ? (
          (() => {
            const latestEnroll = filteredHistory.at(-1); 

            if (latestEnroll.posttest_complete === -1) {
              return (
                <Button
                  variant="contained"
                  color="warning"
                  onClick={() => {
                    const reEnroll = async () => {
                      try {
                        const response = await backend.post(`/enroll/enrollCourse`, {
                          courseId: id,
                          userId: userData.id,
                        }, { withCredentials: true });

                        if (response.status === 200) {
                          navigate(`/course/${id}/pretest/${response.data.enrollmentId}`);
                        }
                      } catch (error) {
                        console.log(error);
                      }
                    };
                    reEnroll();
                  }}
                >
                  สมัครเรียนใหม่
                </Button>
              );
            } else if (
              latestEnroll.pretest_complete === 1 &&
              latestEnroll.posttest_complete === 1 &&
              latestEnroll.completed_labs === latestEnroll.total_labs
            ) {
              return <Typography variant="subtitle1" align="center" color="green">
                        คุณสำเร็จคอร์สนี้แล้ว
                        <CheckIcon color="success" sx={{ ml: 1, mb: -0.5 }} />
                      </Typography>;
            } else {
              return <Button variant="contained" onClick={() => handleClick(buttonText)}>{buttonText}</Button>;
            }
          })()
        ) : (
          <></>
        )}
      </td>

    </tr>
  );
}

export default CourseData;