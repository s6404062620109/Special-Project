import React, { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';

import style from './css/home.module.css';


function Home() {
  const [userData, setUserdata] = useState({
    email:'',
    name:''
  });
  const token = localStorage.getItem('authToken');
  const decodeAuthToken = (Authtoken) =>{
      if(!Authtoken){
        console.log('Not authentication.');
        return
      }
      else{
        const decodedToken = jwtDecode(Authtoken);
        const currentTime = Date.now() / 1000;
        if (decodedToken.exp < currentTime) {
          localStorage.removeItem('authToken');
          console.log('Token expired. Logging out.');
          navigate('/login'); 
        }
        else{
          setUserdata({
            email: decodedToken.email,
            name: decodedToken.name
          })
        }
      }
  }
  
  useEffect(() => {
    decodeAuthToken(token);
  }, [token]);

  useEffect( () => {
    const fetchUserHistory = async () => {
      try{ 
        const response = await axios.get(`http://localhost:3001/getUserHistory/${userData.email}`);
        console.log(response);
      } catch (error) {
        console.log(error);
      }
    }

    fetchUserHistory();
  }, [userData])

  return (
    <div className={style.container}>
      <p>
        Security Awareness Training
      </p>
    </div>
  )
}

export default Home
