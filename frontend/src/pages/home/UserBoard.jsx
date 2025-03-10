import React, { useEffect, useState } from 'react';

import style from './css/userboard.module.css';

function UserBoard({ email, name , role, profile_img }) {
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
            <p>Information</p>

            <div className={style["information-list"]}>
                <div className={style["information-item"]}>
                    <p>
                        Name:
                    </p>

                    <label>
                        {name}
                    </label>
                </div>

                <div className={style["information-item"]}>
                    <p>
                        Role:
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