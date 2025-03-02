import React, { useEffect, useState } from "react";
import backend from "../../api/backend";

import style from "./css/subjectcard.module.css";
import { useNavigate } from "react-router-dom";

function subjectCard({ id, name, courseId, progress, enrollmentId }) {
  const [isUserLogin, setIsUserlogin] = useState(false);
  const [userData, setUserData] = useState({
    id: null,
    email: null,
    name: null,
    role: null,
    profile_img: null,
  });
  const emailrefStorage = localStorage.getItem("email");
  const navigate = useNavigate("");

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
          setIsUserlogin(true);
        }
      } catch (error) {
        console.log(error);
        if (error.response.status === 403) {
          localStorage.removeItem("email");
        }
      }
    };

    fetchUserData();
  }, [emailrefStorage]);

  const handleStart = () =>{
    if(isUserLogin){
      navigate(`/course/${courseId}/subject/${id}/${enrollmentId}`);
    }
    else{
      alert('Please login first');
      navigate('/');
    }
  }

  const matchedProgress = progress.find(
    (p) => p.subjectId === id && p.type.includes("lab")
  );

  return (
    <tr className={style.content}>
      <td>
        <p>{name}</p>
      </td>

      <td>
        {matchedProgress && matchedProgress.is_completed === 1 ? (
          <p>Completed</p>
        ) : (
          <button onClick={handleStart}>
            Start
          </button>
        )}
      </td>
    </tr>
  );
}

export default subjectCard;
