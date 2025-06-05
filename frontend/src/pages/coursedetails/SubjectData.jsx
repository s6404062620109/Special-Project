import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthProvider";

import style from "./css/subjectdata.module.css";
import { Typography } from "@mui/material";

function SubjectData({ id, name, courseId, progress, enrollmentId }) {
  const { userData } = useContext(AuthContext);
  const navigate = useNavigate("");

  const handleStart = () =>{
    if(userData.id){
      navigate(`/course/${courseId}/subject/${id}/${enrollmentId}`);
    }
    else{
      alert('Please login first');
      navigate('/');
    }
  }

  const matchedProgress = progress.find(
    (p) => p.subjectId === id && p.type.includes("Lab")
  );

  return (
    <tr 
      className={style.content}
      onClick={handleStart}
    >
      <td>
        <Typography variant="body1">{name}</Typography>
      </td>

      {userData.id && (
        <td>
          {(matchedProgress && matchedProgress.is_completed === 1) && (
            <Typography variant="h6">Lab Completed</Typography>
          )}
        </td>
      )}
    </tr>
  );
}

export default SubjectData;
