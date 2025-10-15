import React, { useEffect, useState } from 'react';

import style from './css/userboard.module.css';

function UserBoard({ email, sex, name, surname, role, profile_img }) {
    const [ profileImg, setProfileImg ] = useState('');

    useEffect(() => {
        setProfileImg(profile_img || '/Navbar_Assets/Profile.png');
    },[profile_img])
    
    
  return (
    <div className={style.userBoard}>
        <div className={style["profile-wrap"]}>
            <h2>{name}</h2>

            <img
                alt='user profile image'
                src={profileImg}
            />
        </div>
        
        <div className={style["information-wrap"]}>
            <p>ข้อมูลส่วนตัว</p>

            <div className={style["information-list"]}>
                <div className={style["information-item"]}>
                    <p>
                        เพศ:
                    </p>

                    <label>
                        {sex === "m" && "ชาย"}
                        {sex === "f" && "หญิง"}
                        {sex === "n" && "ไม่ระบุ"}
                    </label>
                </div>

                <div className={style["information-item"]}>
                    <p>
                        ชื่อ-สกุล:
                    </p>

                    <label>
                        {name}-{surname}
                    </label>
                </div>

                <div className={style["information-item"]}>
                    <p>
                        บทบาท:
                    </p>

                    <label>
                        {role === 's' ? (
                            'Student'
                        ) : (
                            'Unknown'
                        )}
                    </label>
                </div>

                <div className={style["information-item"]}>
                    <p>
                        Email:
                    </p>

                    <label>
                        {email}
                    </label>
                </div>
                
            </div>
        </div>

    </div>
  )
}

export default UserBoard