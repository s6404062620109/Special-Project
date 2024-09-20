import React, { useEffect, useState } from 'react'

import style from './css/coursecard.module.css'

function CourseCard({name, detail, icon_id, update}) {

  const token = localStorage.getItem('authToken');
  const lastSubject = Array.isArray(update) && update.length > 0
  ? update.reduce((prev, current) => (prev.value > current.value ? prev : current), update[0])
  : null;

  let buttonText = '';
  if (!token) {
    buttonText = 'View';
  } else if (lastSubject) {
    buttonText = 'Continue';
  } else {
    buttonText = 'Start';
  }

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
        <div>
          <button >{buttonText}</button>
        </div>
    </div>
  )
}

export default CourseCard