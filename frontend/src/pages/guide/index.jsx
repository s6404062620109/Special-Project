import React, { useContext, useEffect, useState } from 'react';
import { Worker, Viewer } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import { AuthContext } from '../../context/AuthProvider';
import { Dialog, Stack, Box, Typography, useMediaQuery } from '@mui/material';

import style from './css/guide.module.css';
import ExpandableCard from './ExpandableCard';
import backend from '../../api/backend';

function Guide() {
  const defaultLayoutPluginInstance = defaultLayoutPlugin();
  const { userData } = useContext(AuthContext);
  const [ preview, setPreview ] = useState(null);
  const [ pdfUrl, setPdfUrl ] = useState(null);
  const [ guideData, setGuideData ] = useState({
    teacherGuide: null,
    labGuide: null,
    studentGuide: null,
  });
  const tabletMedia = useMediaQuery('(max-width: 768px)');

  const handlePreview = (fileOrUrl) => {
      if (pdfUrl && pdfUrl.startsWith("blob:")) {
          URL.revokeObjectURL(pdfUrl);
      }

      if (!fileOrUrl) {
          setPreview(null);
          setPdfUrl(null);
          return;
      }

      if (fileOrUrl instanceof File || fileOrUrl instanceof Blob) {
          const objectUrl = URL.createObjectURL(fileOrUrl);
          setPdfUrl(objectUrl);
      } else if (typeof fileOrUrl === "string") {
          setPdfUrl(fileOrUrl);
      }

      setPreview(fileOrUrl);
  };


  const fetchGuideFiles = async () => {
    try{
       const response = await backend.get(`/admin/getGuide`, {
        withCredentials: true,
       });

       if(response.status === 200){
        setGuideData(response.data);
       }
    } catch(error){
      console.log(error);
    }
  }

  useEffect(() => {
    fetchGuideFiles();
  }, [])

  return (
    <div className={style.pageWrapper}>
      <Stack
        direction="column"
        justifyContent="center"
        alignItems="center"
        sx={{
          width: tabletMedia ? '90%' : '60%',
          margin: '0 auto',
        }}
      >
        <Typography
          variant="h4"
          sx={{ width: '100%', mb: 2 }}
        >
          คู่มือการใช้งานทั้งหมด
        </Typography>

        {userData.role === 'a' && (
          <Stack
            direction="column"
            gap={2}
            sx={{ width: '100%', margin: '16px auto' }}
          >
            <ExpandableCard
              title="คู่มือการใช้งานสำหรับอาจารย์"
              handlePreview={handlePreview}
              guideData={guideData}
            />
            <ExpandableCard
              title="คู่มือการใช้งานสำหรับนักเรียน"
              handlePreview={handlePreview}
              guideData={guideData}
            />
          </Stack>
        )}
      </Stack>

      <Dialog
        open={Boolean(pdfUrl)}
        onClose={() => {
            if (pdfUrl && pdfUrl.startsWith("blob:")) {
                URL.revokeObjectURL(pdfUrl);
            }
            setPdfUrl(null);
            setPreview(null);
        }}
        fullWidth
        maxWidth="md"
        sx={{
          zIndex: "10000"
        }}
      >
        <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
          <Box>
            <Stack gap={2}>
               <Box sx={{ flex: 1, minWidth: 0, height: "80vh" }}>
                {pdfUrl && (
                  <Viewer
                    fileUrl={pdfUrl}
                    plugins={[defaultLayoutPluginInstance]}
                  />
                )}
              </Box>
            </Stack>
          </Box>
        </Worker>
      </Dialog>
    </div>
  );
}

export default Guide;
