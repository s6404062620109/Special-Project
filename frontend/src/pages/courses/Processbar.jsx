import React, { useEffect, useState } from "react";

import style from "./css/processbar.module.css";

/* Cal Percent */

// pre / post test = 1;
// maxlabscore = 8;
// maxlavscore & pre&post = 10;

/* Cal Percent */

function Processbar({ pretest_complete, posttest_complete, completed_labs, total_labs }) {
  const [percent, setPercent] = useState(0);
  const [isFailed, setIsFailed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const delay = 2000;

    const timer = setTimeout(() => {
      if (pretest_complete === -1 || posttest_complete === -1) {
        setIsFailed(true);
        setIsLoading(false);
        return;
      }

      let newPercent = 0;

      if (total_labs === 0) {
        if (pretest_complete === 1) {
          newPercent += 50;
        }
        if(posttest_complete === 1) {
          newPercent += 50;
        }
      }
      if (total_labs > 0) {
        if (pretest_complete === 1) newPercent += 10;
        if (posttest_complete === 1) newPercent += 10;
        newPercent += (completed_labs / total_labs) * 80;
      }

      if (newPercent > 100) newPercent = 100;

      setPercent(newPercent);
      setIsFailed(false);
      setIsLoading(false);
    }, delay);

    return () => clearTimeout(timer);
  }, [pretest_complete, posttest_complete, completed_labs, total_labs]);

  const processStyle = {
    width: isLoading || isFailed ? "100%" : `${percent.toFixed(0)}%`,
    backgroundColor: isFailed ? "#E30600" : isLoading ? "transparent" : undefined,
    transition: "width 0.5s ease-out, background-color 0.5s ease-out",
  };

  const labelStyle = {
    color: isFailed ? "white" : "black",
  };

  return (
    <div className={style.container}>
      <label style={labelStyle}>{isLoading ? "Loading..." : isFailed ? "คุณเรียนไม่ผ่าน" : `${percent.toFixed(0)}%`}</label>
      <div className={`${style.process} ${isLoading && !isFailed ? style.loading : ""}`} style={processStyle}></div>
    </div>
  );
}

export default Processbar;
