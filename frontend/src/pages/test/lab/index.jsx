import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import backend from "../../../api/backend";

import style from "./css/renderlab.module.css";

function RenderLab() {
  const { subjectId, questionId } = useParams();
  const [files, setFiles] = useState([]);
  const [fileContent, setFileContent] = useState("");
  const [userData, setUserData] = useState({
    id: null,
    email: null,
    name: null,
    role: null,
    profile_img: null,
  });
  const emailrefStorage = localStorage.getItem("email");
  const [answer, setAnswer] = useState("");

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

    const fetchAnswer = async () => {
      try {
        const response = await backend.get(
          `/lab-test/getAnswerForLabTest/${subjectId}/${questionId}`
        );

        if (response.status === 200) {
          setAnswer(response.data.result[0].content);
        }
      } catch (error) {
        console.log(error);
      }
    };
    fetchAnswer();
  }, [emailrefStorage]);

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const response = await backend.get(
          `/lab-test/getLabFile/${questionId}`
        );
        if (response.status === 200) {
          setFiles(response.data.files);
        }
      } catch (error) {
        console.log("Error fetching lab files:", error);
      }
    };

    fetchFiles();
  }, [questionId]);

  const fetchFileContent = async (fileName) => {
    try {
      const response = await backend.get(
        `/lab-test/getLabFileContent/${questionId}/${fileName}`
      );
      if (response.status === 200) {
        setFileContent(response.data);
      }
    } catch (error) {
      console.log("Error fetching file content:", error);
    }
  };

  return (
    <div className={style.renderLab}>
      <h2>Lab Files</h2>
      
      <ul>
        {files.map((file, index) => (
          <li key={index}>
            <button onClick={() => fetchFileContent(file)}>{file}</button>
          </li>
        ))}
      </ul>

      <div className={style.labPreview}>
        <h3>Preview:</h3>
        <iframe srcDoc={fileContent} title="Lab Preview" />
      </div>
    </div>
  );
}

export default RenderLab;
