import React, { useEffect, useState } from "react";

import style from "./css/processbar.module.css";
import backend from "../../api/backend";

/* Cal Percent */

// pre / post test = 1;
// maxlabscore = 8;
// maxlavscore & pre&post = 10;

/* Cal Percent */

function Processbar({ pretest_complete, posttest_complete, completed_labs, total_labs }) {
  const [percent, setPercent] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const delay = 3000;

    const timer = setTimeout(() => {
      let newPercent = 0;

      if (pretest_complete) newPercent += 10;
      if (posttest_complete) newPercent += 10;

      if (completed_labs > 0 && total_labs > 0 && completed_labs <= total_labs) {
        newPercent += (completed_labs / total_labs) * 80;
      }

      setPercent(newPercent);
      setIsLoading(false);
    }, delay);

    return () => clearTimeout(timer);
  }, [pretest_complete, posttest_complete, completed_labs, total_labs]);

  return (
    <div className={style.container}>
      <label>{isLoading ? "Loading..." : `${percent.toFixed(0)}%`}</label>
      <div
        className={`${style.process} ${isLoading ? style.loading : ""}`}
        style={{ width: isLoading ? "100%" : `${percent.toFixed(0)}%` }}
      ></div>
    </div>
  );
}

export default Processbar;
