import { useEffect, useState } from 'react';
import { Worker, Viewer } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
import { Box, CircularProgress, Stack, Typography } from '@mui/material';

function PdfReader({ subjectName, fileUrl }) {
  const defaultLayoutPluginInstance = defaultLayoutPlugin();
  const [pdfUrl, setPdfUrl] = useState('');


  useEffect(() => {
    if (!fileUrl) return;

    if (fileUrl instanceof File || fileUrl instanceof Blob) {
      const objectUrl = URL.createObjectURL(fileUrl);
      setPdfUrl(objectUrl);

      return () => {
        URL.revokeObjectURL(objectUrl);
      };
    } else if (typeof fileUrl === 'string') {
      setPdfUrl(fileUrl);
    }
  }, [fileUrl]);

  if (!pdfUrl) return <CircularProgress color="secondary" />;

  return (
    <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
      <Stack gap={2}>
        <Typography variant='h5' fontWeight='600'>{subjectName}</Typography>
        <Viewer fileUrl={pdfUrl} plugins={[defaultLayoutPluginInstance]} />
      </Stack>
    </Worker>
  );
}

export default PdfReader;
