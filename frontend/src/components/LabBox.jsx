import React, { useEffect, useState } from "react";
import backend from "../api/backend";
import { useNavigate } from "react-router-dom";

import style from "./css/labbox.module.css";

function LabBox({ no, id, question, type, courseId, enrollmentId }) {
  const [focus, setFocus] = useState(false);
  const [answer, setAnswer] = useState([]);
  const [checkStatus, setCheckStatus] = useState("");
  const [userData, setUserData] = useState({
    id: null,
    email: null,
    name: null,
    role: null,
    profile_img: null,
  });
  const emailrefStorage = localStorage.getItem("email");
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
          alert("Your session time out!");
          navigate("/");
        }
      }
    };
    fetchUserData();
  }, [emailrefStorage]);

  const handleAnswerChange = (questionId, answer) => {
    setAnswer((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const fetchLatestProgress = async (enrollmentId) => {
    try {
      const response = await backend.get(
        `/progress/getLatestProgress/${enrollmentId}`
      );

      if (response.status === 200) {
        window.location.href = `/course/${courseId}/${response.data.inProgress}`;
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await backend.post("/lab/submitLabanswer", {
        answer: answer,
        userId: userData.id,
      });

      if (response.status === 200) {
        setCheckStatus(response.data.message);

        if (response.data.message === "Pass") {
          fetchLatestProgress(response.data.enrollmentId);
        }
        if (response.data.message === "Failed") {
          setTimeout(() => window.location.reload(), 2000);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleStartContainer = async () => {
    const clientUrl = import.meta.env.VITE_CLIENT_URL || window.location.origin;
    const url = `${clientUrl}/lab/question/${id}`;
    window.open(url, "_blank");
  };

  const formatContent = (content) => {
    if (!content) return null;
    return content.split("\n").map((str, index) => (
        <React.Fragment key={index}>
            {str}
            <br />
        </React.Fragment>
    ));
  };

  return (
    <div className={style.container}>
      <div className={style.content}>
        <div className={style.questionBox}>
          <div className={style.question}>
            <h3>
              {no}. {formatContent(question)}
            </h3>
            <div className={style["form-wrapper"]}>
              <form onSubmit={(e) => handleSubmit(e)}>
                {type === "lab-w" && (
                  <button type="button" onClick={handleStartContainer}>
                    START
                  </button>
                )}

                <input
                  type="text"
                  onChange={(e) => handleAnswerChange(id, e.target.value)}
                  onFocus={() => setFocus(true)}
                  onBlur={() => setFocus(false)}
                  className={`${style.inputText} ${
                    focus ? style.focusInput : ""
                  }`}
                />

                {!checkStatus ? (
                  <input type="submit" value="Submit" />
                ) : (
                  <p>{checkStatus}</p>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LabBox;
