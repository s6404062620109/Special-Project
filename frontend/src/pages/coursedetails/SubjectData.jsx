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
      return;
    }
    else{
      alert('โปรดเข้าสู่ระบบก่อนเข้าเรียน');
      navigate('/');
      return;
    }
  }

  const matchedProgressList = progress.filter(
  (p) =>
    p.subjectId === id &&
    (p.typeId === 3 || p.typeId === 4 || p.typeId === 5 || p.typeId === 6)
  );

  const isAllCompleted = matchedProgressList.length > 0 && matchedProgressList.every((p) => p.is_completed === 1);

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
          {isAllCompleted && (
            <Typography variant="h6" color="green">Lab Completed</Typography>
          )}
        </td>
      )}
    </tr>
  );
}

export default SubjectData;
