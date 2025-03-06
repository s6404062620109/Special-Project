import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import backend from "../../../api/backend";

import style from "./css/editcourse.module.css";
import EditPopup from "./EditPopup";

function EditCourse() {
  const { courseId } = useParams();
  const [data, setData] = useState({
    courseInfo: {},
    subject: [],
  });
  const [courseIconPath, setCourseIconPath] = useState("");
  const [isPopupOpen, setIsPopupOpen] = useState(false);
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
          { withCredentials: true }
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
          alert("You session time out, please login again.");
          navigate("/");
        }
      }
    };
    fetchUserData();
  }, [emailrefStorage]);

  const fetchSubjects = async () => {
    try {
      const response = await backend.get(
        `/subjects/getAllSubject/${courseId}`
      );

      if (response.status === 200) {
        setData({
          courseInfo: response.data.courseInfo[0],
          subject: response.data.subject,
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, [courseId]);

  useEffect(() => {
    const fetchCourseIcon = async () => {
      try {
        const response = await backend.get(
          `/imgrender/getIcon/${data.courseInfo.id}/${data.courseInfo.icon_id}`
        );
        if (response.status === 200) {
          setCourseIconPath(
            `${import.meta.env.VITE_API_BASE_URL}${response.data.url}`
          );
        }
      } catch (error) {
        console.log(error);
      }
    };

    fetchCourseIcon();
  }, [data.courseInfo]);

  const handleEdit = (subjectId) => {
    console.log("Edit subject with ID:", subjectId);
  };

  const handleDelete = async (subjectId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this subject?"
    );
    if (!confirmDelete) return;

    try {
      const response = await backend.delete(
        `/teacher/deleteSubjectOnCourse/${courseId}/${subjectId}/${userData.id}`
      );
      if (response.status === 200) {
        alert(response.data.message);
        setData((prevData) => ({
          ...prevData,
          subject: prevData.subject.filter(
            (subject) => subject.id !== subjectId
          ),
        }));
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleSaveCourse = () => {
    setIsPopupOpen(false);
    fetchSubjects();
  };

  return (
    <div className={style["edit-course-container"]}>
      <div className={style.container}>
        <div className={style.head}>
          <img alt="course icon" src={courseIconPath} width={50} height={50} />
          <h2>{data.courseInfo.name}</h2>
          <button onClick={() => setIsPopupOpen(true)}>
            <img src="/My_Coursesp/Edit.svg" alt="Edit button" />
            Edit
          </button>
        </div>

        <div className={style.body}>
          <div className={style.tableWrapper}>
            <table className={style.subjectTable}>
              <tbody>
                {data.subject.length > 0 ? (
                  data.subject.map((subject) => (
                    <tr key={subject.id}>
                      <td>{subject.name}</td>
                      <td>
                        <button
                          className={style.editButton}
                          onClick={() => handleEdit(subject.id)}
                        >
                          <img src="/My_Coursesp/Edit.svg" alt="Edit button" />
                          Edit
                        </button>
                      </td>
                      <td>
                        <button
                          className={style.deleteButton}
                          onClick={() => handleDelete(subject.id)}
                        >
                          <img src="/My_Coursesp/Bin.svg" alt="Delete button" />
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3">No subjects found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className={style["add-button"]} onClick={() => navigate(`/add-subject/${courseId}`)}>
        <img alt="Add button" src="/My_Coursesp/Add.svg" />
        <p>Add Subject</p>
      </div>

      {isPopupOpen && (
        <EditPopup
          courseInfo={data.courseInfo}
          onClose={() => setIsPopupOpen(false)}
          onSave={handleSaveCourse}
        />
      )}
    </div>
  );
}

export default EditCourse;
