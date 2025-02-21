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

      try{
        const response = await backend.get(`/auth/authorization/${emailrefStorage}`, {
          withCredentials: true
        });
        if(response.status === 200){
          setUserData({
            id:response.data.id,
            email:response.data.email,
            name:response.data.name,
            role:response.data.role,
            profile_img:response.data.profile_img,
          });
        }

      } catch(error){
        console.log(error);
        if(error.response.status === 403){
          localStorage.removeItem('email');
        }
      }
      
    }
    fetchUserData();
  },[emailrefStorage]);

  return (
    <div className={style.container}>
      <div className={style["container-wrap"]}>
        {loginEnable === true ? (
          <div className={style["login-tablet"]}>
            <Login />
          </div>
        ) : (
          <div className={style.content}>
            {userData.role === 's' || !userData.role &&(
              <p className={style.title}>
                Security <br /> Awareness Training
              </p>
            )}

            {userData.role === 't' &&(
              <p className={style.title}>
                Security <br /> Awareness Training <br/> For Teacher.
              </p>
            )}

            {userData.role === 'a' &&(
              <p className={style.title}>
                Security <br /> Awareness Training <br/> For Admin.
              </p>
            )}
            
            {!userData.id&&(
              <p className={style["sub-title"]}>
                การอบรมเพื่อสร้างความรู้และความตระหนักรู้เกี่ยวกับความปลอดภัยทาง
                ไซเบอร์ให้กับบุคลากรในองค์กรโดยเน้นให้เข้าใจถึงภัยคุกคามที่อาจเกิดขึ้น
              </p>
            )}
          </div>
        )}

        {!userData.id &&(
          <div className={style["login-wrap"]}>
            <Login />
          </div>
        )}

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
