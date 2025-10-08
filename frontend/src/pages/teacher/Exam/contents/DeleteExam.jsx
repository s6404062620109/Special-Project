import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Box,
  Button,
  Stack,
  Typography,
  Pagination,
} from "@mui/material";

import PreviewIcon from "@mui/icons-material/Preview";
import QuestionItem from "../component/QuestionItem";

export const DeleteExam = ({
  questions,
  setPreviewOpen,
  handleImgChange,
  handleQuestionChange,
  handleChoiceChange,
  handleAddChoice,
  handleDeleteQuestion,
  handleDeleteChoice,
  handleSubmit,
}) => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 10;
  const pageCount = Math.ceil(questions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentQuestions = questions.slice(startIndex, endIndex);

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
    window.scrollTo(0, 0);
  };
  return (
    <Stack
      alignItems="center"
      sx={{
        width: "100%",
        marginTop: "20px",
        gap: 2,
      }}
    >
      <Box
        sx={{
          background: "white",
          padding: "20px",
          borderRadius: "8px",
          width: "90%",
        }}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography variant="h5" fontWeight="bold">
            แก้ไขคำถาม
          </Typography>

          <Button 
            variant="outlined" 
            startIcon={<PreviewIcon />}
            onClick={setPreviewOpen}
          >
            ดูตัวอย่าง
          </Button>
        </Stack>

        <Stack>
          {currentQuestions.map((question, index) => {
            const originalIndex = startIndex + index;
            return (
              <QuestionItem
                key={question.id || originalIndex}
                index={originalIndex}
                question={question}
                onQuestionChange={handleQuestionChange}
                onChoiceChange={handleChoiceChange}
                onAddChoice={handleAddChoice}
                onDeleteChoice={handleDeleteChoice}
                onDeleteQuestion={handleDeleteQuestion}
                onOpenImg={handleImgChange}
              />
            );
          })}

          {questions.length === 0 && (
            <Stack
              justifyContent="center"
              alignItems="center"
              sx={{
                width: "100%",
                height: "200px",
                backgroundColor: "#f8f7f7ff",
                borderRadius: "8px",
                margin: "16px auto",
              }}
            >
              <Typography variant="h4" color="error">
                ไม่พบคำถามที่คลังข้อมูล
              </Typography>
            </Stack>
          )}
        </Stack>

        {pageCount > 1 && (
          <Stack 
            sx={{ 
              width: "100%",
              mt: 3 
            }}
          >
            <Pagination
              count={pageCount}
              page={currentPage}
              onChange={handlePageChange}
              color="primary"
              sx={{
                display: 'flex',
                justifyContent: 'center'
              }}
            />
          </Stack>
        )}
      </Box>

      <Stack
        sx={{
          width: { xs: "60%", sm: "40%" },
          gap: 2,
          flexDirection: { xs: "column", sm: "row" },
        }}
      >
        <Button
          variant="outlined"
          sx={{
            background: "red",
            color: "white",
            width: { xs: "100%", sm: "50%" },
          }}
          onClick={() => navigate(-1)}
        >
          ยกเลิก
        </Button>

        <Button
          variant="contained"
          sx={{
            background: "green",
            width: { xs: "100%", sm: "50%" },
          }}
          onClick={handleSubmit}
        >
          ยืนยัน
        </Button>
      </Stack>
    </Stack>
  );
};
