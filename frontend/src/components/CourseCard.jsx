import React, { useEffect, useState } from 'react'

import style from './css/coursecard.module.css'

function CourseCard({name, detail, icon_id, update}) {

  const lastSubject = update.reduce((prev, current) => {
    return (prev.value > current.value) ? prev : current;
  }, update[0]);

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
          {lastSubject && (
            <button>Continue</button>
          )}
          {!lastSubject && (
            <button>Start</button>
          )}
        </div>
    </div>
  )
}

export default CourseCard