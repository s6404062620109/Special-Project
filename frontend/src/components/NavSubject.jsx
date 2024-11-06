import React, { useEffect, useState } from "react";
import style from "./css/navsubject.module.css";
import axios from "axios";

function NavSubject({ courseId }) {
  const [navlist, setNavlist] = useState({
    subjectIds: [],
    subjectNames: [],
    Pretest: `/course/${courseId}/pretest`,
    Posttest: ``,
  });

  useEffect(() => {
    const fetchSubject = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3001/getAllSubject/${courseId}`
        );

        const subjectIds = response.data.subject.map(
          (subject) => subject.SubjectID
        );

        const subjectNames = response.data.subject.map(
          (subject) => subject.Name
        );

        setNavlist((prev) => ({
          ...prev,
          subjectIds: subjectIds,
          subjectNames: subjectNames,
        }));
      } catch (error) {
        console.log(error);
      }
    };
    fetchSubject();
  }, [courseId]);

  return (
    <div className={style["Nav-Subject"]}>
      <ul>
        <li>All Subject</li>

        <div className={style["subjectlist-wrap"]}>
            {navlist.subjectNames.map((name, ind) => (
            <li key={ind}>
                <list
                onClick={() =>
                    (window.location.href = `/course/${courseId}/subject/${navlist.subjectIds[ind]}`)
                }
                >
                {name}
                </list>
            </li>
            ))}
        </div>

        <div className={style["testlist-wrap"]}>
            <li onClick={() => (window.location.href = navlist.Pretest)}>
            Pre-Test
            </li>
            <li onClick={() => (window.location.href = navlist.Posttest)}>
            Post-Test
            </li>
        </div>
      </ul>
    </div>
  );
}

export default NavSubject;
