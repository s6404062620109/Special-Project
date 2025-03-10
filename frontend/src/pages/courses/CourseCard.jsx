import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Processbar from "./Processbar";
import backend from "../../api/backend";

import style from "./css/coursecard.module.css";

function CourseCard({ id, name, icon_id, enrollmentId, courseId }) {

  const [userData, setUserData] = useState({
    id: null,
    email: null,
    name: null,
    role: null,
    profile_img: null,
  });
  const emailrefStorage = localStorage.getItem("email");
  const [imgPath, setImgPath] = useState("");
  const [buttonText, setButtonText] = useState("");
  const [history, setHistory] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await backend.get(
          `/auth/authorization/${emailrefStorage}`,
          {
            withCredentials: true,
          }
        );
        if (response.status === 200) {
          setUserData({
            id: response.data.id,
            email: response.data.email,
            name: response.data.name,
            role: response.data.role,
            profile_img: response.data.profile_img,
          });
        }
      } catch (error) {
        console.log(error);
        if (error.response.status === 403) {
          localStorage.removeItem("email");
        }
      }
    };
    fetchUserData();

    const fetchIcon = async () => {
      try {
        const response = await backend.get(`/imgrender/getIcon/${id}/${icon_id}`);
        if (response.status === 200) {
          setImgPath(`${import.meta.env.VITE_API_BASE_URL}${response.data.url}`);
        }
      } catch (err) {
        console.log("Error fetching icon:", err);
      }
    };
    fetchIcon();
  }, [emailrefStorage, id, icon_id]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await backend.get(
          `/enroll/checkCoursesEnroll/${userData.id}`
        );
        if (response.status === 200) {
          setHistory(response.data.results);
        }
      } catch (err) {
        console.log("Error fetching icon:", err);
      }
    };

    fetchHistory();
  }, [userData]);

  useEffect(() => {
    if (!emailrefStorage && !userData.id && !userData.email && !userData.name && !userData.role) {
      setButtonText("View");
    } else if (enrollmentId !== null) {
      setButtonText("Continue");
    } else {
      setButtonText("Start");
    }
  }, [emailrefStorage, userData, enrollmentId]);

  const handleClick = (status) => {
    if (status === "Continue") {
      const fetchLatestProgress = async () => {
        try {
          const response = await backend.get(
            `/progress/getLatestProgress/${enrollmentId}`
          );
          console.log(response);
          if (response.status === 200) {
            navigate(`/course/${courseId}/${response.data.inProgress}`);
          }
        } catch (error) {
          console.log(error);
        }
      };

      fetchLatestProgress();
    } else if (status === "Start") {
      const enrollCourse = async () => {
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
      enrollCourse();
    } else {
      navigate(`/course/${id}`);
    }
  };

  const filteredHistory = history.filter((enroll) => enroll.courseId === id);
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
          <img alt="Icon Image" src={imgPath} />
          <p>{name}</p>
        </div>
      </td>

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
          <Processbar
            pretest_complete={false}
            posttest_complete={false}
            completed_labs={0}
            total_labs={0}
          />
        )}
      </td>


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

export default CourseCard;
