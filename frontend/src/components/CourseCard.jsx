import React from 'react'

import style from './css/coursecard.module.css'

function CourseCard({name, detail, icon_id}) {  
  return (
    <div className={style.card}>
        <img
            alt='Icon Image'
            src={`./Course_Assets/${icon_id}.png`}
        />
        <div className={style.infoContent}>
            <h1>{name}</h1>
            <p>{detail}</p>
        </div>
    </div>
  )
}

export default CourseCard