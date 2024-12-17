import React, { useEffect, useState } from 'react';

import style from './css/home.module.css';
import backend from '../../api/backend';
import Login from '../authenticate/login';

function Home() {
  const [userData, setUserdata] = useState({
    email:'',
    name:'',
    role:'',
  });
  const token = localStorage.getItem('authToken');
  
  const decodeAuthToken = async (token) => {
    if(!token){
      console.log('Not authentication.');
      return
    }
    else{
      try{
        const response = await backend.get('/auth/authorization', {
          headers: {
            'Authorization': `Bearer ${token}`
          } 
        });

        if(response.status === 200){
          setUserdata({ email: response.data.result[0].Email, name: response.data.result[0].Name, role: response.data.result[0].Role })
        }

      } catch (error) {
        console.log(error);
      }
    }
  }

  useEffect(() => {
    decodeAuthToken(token);
  }, [token]);

  return (
    <div className={style.container}>
      <div className={style["container-wrap"]}>
        <div className={style.content}>
          <p className={style.title}> 
            Security <br /> Awareness Training 
          </p>
          <p className={style["sub-title"]}>
            การอบรมเพื่อสร้างความรู้และความตระหนักรู้เกี่ยวกับความปลอดภัยทาง <br/>
            ไซเบอร์ให้กับบุคลากรในองค์กรโดยเน้นให้เข้าใจถึงภัยคุกคามที่อาจเกิดขึ้น
          </p>
        </div>

        <Login/>
      </div>
    </div>
  )
}

export default Home
