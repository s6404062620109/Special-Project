import React, { useEffect, useState } from "react";

import style from "./css/home.module.css";
import backend from "../../api/backend";
import Login from "../authenticate/login";

function Home() {
  const [userData, setUserData] = useState({
    id: null,
    email: null,
    name: null,
    role: null,
    profile_img: null,
  });
  const emailrefStorage = localStorage.getItem("email");
  const [loginEnable, setLoginEnable] = useState(false);

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
      }
    };
    fetchUserData();
  }, [emailrefStorage]);

  return (
    <div className={style.container}>
      <div className={style["container-wrap"]}>
        {loginEnable === true ? (
          <div className={style["login-tablet"]}>
            <Login />
          </div>
        ) : (
          <div className={style.content}>
            <p className={style.title}>
              Security <br /> Awareness Training
            </p>
            <p className={style["sub-title"]}>
              การอบรมเพื่อสร้างความรู้และความตระหนักรู้เกี่ยวกับความปลอดภัยทาง
              ไซเบอร์ให้กับบุคลากรในองค์กรโดยเน้นให้เข้าใจถึงภัยคุกคามที่อาจเกิดขึ้น
            </p>
          </div>
        )}

        <div className={style["login-wrap"]}>
          <Login />
        </div>

        <div className={style["login-nav"]}>
          <p onClick={() => setLoginEnable(!loginEnable)}>
            {loginEnable === true ? (
              <>{"<-"} Get Back</>
            ) : (
              <>Do you want join members for study?</>
            )}
          </p>
        </div>
        
      </div>
    </div>
  );
}

export default Home;
