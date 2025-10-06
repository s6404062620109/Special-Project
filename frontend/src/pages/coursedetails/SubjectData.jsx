import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthProvider";

import style from "./css/subjectdata.module.css";
import { Typography } from "@mui/material";
import CheckIcon from '@mui/icons-material/Check';
import ClearIcon from '@mui/icons-material/Clear';

function SubjectData({ id, name, courseId, labProgress, enrollmentId }) {
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

  const matchedProgressList = labProgress.filter(
    (p) =>
      Number(p.subjectId) === Number(id) &&
      [3, 4, 5, 6].includes(p.typeId)
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
            <CheckIcon color="success" />
          )}
          {labProgress.length > 0 && !isAllCompleted &&(
            <ClearIcon color="error" />
          )}
        </td>
      )}
    </tr>
  );
}

export default SubjectData;
