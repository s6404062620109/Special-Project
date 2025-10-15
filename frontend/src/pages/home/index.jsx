import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/AuthProvider";
import backend from "../../api/backend";
import Login from "../authenticate/login";
import UserBoard from "./UserBoard";
import CourseBoard from "./CourseBoard";

import style from "./css/home.module.css";
import { Button } from "@mui/material";
import { ArrowBack, ArrowBackIos } from "@mui/icons-material";


function Home() {
  const { userData } = useContext(AuthContext);
  const [ loginEnable, setLoginEnable ] = useState(false);
  const [ enrollment, setEnrollment ] = useState([]);

  const fetchEnrollment = async () => {
    try {
      const response = await backend.get(`/enroll/checkCoursesEnroll/${userData.id}`, {
        withCredentials: true,
      });
      if (response.status === 200) {
        setEnrollment(response.data.results);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (userData.id && userData.role === "s") {
      fetchEnrollment();
    }
  }, [userData.id]);

  return (
    <div className={style.pageWrapper}>
      <div className={style.container}>
        {!userData.id && (
          <div className={style["container-wrap"]}>
            {loginEnable === true ? (
              <div className={style["login-tablet"]}>
                <Login />
              </div>
            ) : (
              <div className={style.content}>
                {userData.role === null && (
                  <p className={style.title}>
                    Security <br /> Awareness Training
                  </p>
                )}
                {userData.role === null && (
                  <p className={style["sub-title"]}>
                    การอบรมเพื่อสร้างความรู้และความตระหนักรู้เกี่ยวกับความปลอดภัยทาง
                    ไซเบอร์ให้กับบุคลากรในองค์กรโดยเน้นให้เข้าใจถึงภัยคุกคามที่อาจเกิดขึ้น
                  </p>
                )}
              </div>
            )}

            {!userData.id && (
              <div className={style["login-wrap"]}>
                <Login />
              </div>
            )}

            {!userData.id && (
              <div className={style["login-nav"]}>
                <p onClick={() => setLoginEnable(!loginEnable)}>
                  {loginEnable === true ? (
                    <Button
                      variant="text"
                      onClick={() => setLoginEnable(!loginEnable)}
                      startIcon={<ArrowBackIos/>}
                    >
                      ย้อนกลับ
                    </Button>
                  ) : (
                    <>เข้าสู่ระบบ/สมัครสมาชิก</>
                  )}
                </p>
              </div>
            )}
          </div>
        )}

        {userData.id && userData.role === "s" && (
          <div className={style["container-wrap"]}>
            <UserBoard
              email={userData.email}
              sex={userData.sex}
              name={userData.name}
              surname={userData.surname}
              role={userData.role}
              profile_img={userData.profile_img}
            />
            <CourseBoard enrollment={enrollment} />
          </div>
        )}

        {userData.id && userData.role === "t" && (
          <div className={style["container-wrap"]}>
            <div className={style.content}>
              <p className={style.title}>
                Security <br /> Awareness Training <br /> For Teacher.
              </p>
            </div>
          </div>
        )}

        {userData.id && userData.role === "a" && (
          <div className={style["container-wrap"]}>
            <div className={style.content}>
              <p className={style.title}>
                Security <br /> Awareness Training <br /> For Admin.
              </p>
            </div>
          </div>
        )}
      </div>

      
    </div>
  );
}

export default Home;
