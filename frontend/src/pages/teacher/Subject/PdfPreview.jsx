import * as React from 'react';
import { Viewer, Worker } from '@react-pdf-viewer/core';
import '@react-pdf-viewer/core/lib/styles/index.css';

import style from './css/pdfpreview.module.css';

const PdfPreview = ({ fileUrl }) => {
  return (
    <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.0.279/build/pdf.worker.min.js">
      <div className={style["pdf-preview-container"]}>
        <Viewer fileUrl={fileUrl} />
      </div>
    </Worker>
  );
};

export default PdfPreview;