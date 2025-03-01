import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import backend from "../../../api/backend";
import style from "./css/renderlab.module.css";

function RenderLab() {
  const { questionId } = useParams();
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
        const response = await backend.get(`/auth/authorization/${emailrefStorage}`,
          {withCredentials: true}
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

  return (
    <div className={style.container}>
      <div className={style.labPreview}>
        <iframe 
          src={`${import.meta.env.VITE_API_BASE_URL}/lab-test/renderLab/${questionId}`} 
          title="Lab Preview" 
          sandbox="allow-scripts allow-same-origin"
        />
      </div>
    </div>
  );
}

export default RenderLab;
