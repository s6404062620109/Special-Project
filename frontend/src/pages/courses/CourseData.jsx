import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Processbar from "./Processbar";
import backend from "../../api/backend";
import { AuthContext } from "../../context/AuthProvider";

import style from "./css/coursedata.module.css";


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
      const response = await backend.get(`/progress/getLatestProgress/${enrollmentId}`);

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
    if (status === "Continue") {
      fetchLatestProgress();
    } 
    
    else if (status === "Start") {
      enrollCourse();
    } 
    
    else {
      navigate(`/course/${id}`);
    }
  };

  const filteredHistory = history.filter((enroll) => enroll.courseId === id);

  useEffect(() => {   
    fetchHistory();

    if (!userData.id) {
      setButtonText("View");
    } else if (enrollmentId !== null) {
      setButtonText("Continue");
    } else {
      setButtonText("Start");
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
          {userData.id &&(
            <>
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
                <>-</>
              )}
            </>
          )}          
          
        </div>
      </td>

      {userData.id && (
        <td>
          {filteredHistory.length > 0 ? (
            (() => {
              const latestEnroll = filteredHistory.at(-1);

              return (
                <p>
                  {latestEnroll.posttest_complete === -1
                    ? "FAILED"
                    : latestEnroll.pretest_complete === 1 &&
                      latestEnroll.posttest_complete === 1 &&
                      latestEnroll.completed_labs === latestEnroll.total_labs
                    ? "DONE"
                    : "WORKING"}
                </p>
              );
            })()
          ) : (
            <p>-</p>
          )}
        </td>
      )}

      {userData.id &&(
        <td>
          <p>{name}</p>
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
            <>-</>
          )}
        </td>
      )}

      <td>
        {filteredHistory.length > 0 ? (
          (() => {
            const latestEnroll = filteredHistory.at(-1); 

            if (latestEnroll.posttest_complete === -1) {
              return (
                <button
                  onClick={() => {
                    const reEnroll = async () => {
                      try {
                        const response = await backend.post(`/enroll/enrollCourse`, {
                          courseId: id,
                          userId: userData.id,
                        });

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
                  Retry
                </button>
              );
            } else if (
              latestEnroll.pretest_complete === 1 &&
              latestEnroll.posttest_complete === 1 &&
              latestEnroll.completed_labs === latestEnroll.total_labs
            ) {
              return <p>Complete!</p>;
            } else {
              return <button onClick={() => handleClick(buttonText)}>{buttonText}</button>;
            }
          })()
        ) : (
          <button onClick={() => handleClick(buttonText)}>{buttonText}</button>
        )}
      </td>


    </tr>
  );
}

export default CourseData;
