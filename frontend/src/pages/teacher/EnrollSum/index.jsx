import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import backend from "../../../api/backend";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Collapse,
  Box,
  Typography,
  Button,
  Stack,
  TableSortLabel,
  CircularProgress,
  useMediaQuery,
} from "@mui/material";
import { KeyboardArrowDown, KeyboardArrowLeft, KeyboardArrowUp } from "@mui/icons-material";

function GroupedProgressRow({ progress, pretestScore, posttestScore, labtestScore }) {
  const [openPre, setOpenPre] = useState(false);
  const [openPost, setOpenPost] = useState(false);
  const [openLab, setOpenLab] = useState(false);

  // รวมทุกคำถาม
  const allQuestions = progress.flatMap((p) => p.questions || []);

  const pretest = allQuestions.filter((q) => q.typeId === 1);
  const posttest = allQuestions.filter((q) => q.typeId === 2);
  const labs = allQuestions.filter((q) => q.typeId !== 1 && q.typeId !== 2);

  const renderQuestionTable = (questions) => (
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell>คำถาม</TableCell>
          <TableCell>คำตอบที่ถูก</TableCell>
          <TableCell>คำตอบของผู้ใช้</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {questions.map((q) => {
          const corrects = Array.isArray(q.correctAnswers)
            ? Array.from(new Set(q.correctAnswers))
            : [q.correctAnswers ?? "-"];

          const users = Array.isArray(q.userAnswers)
            ? Array.from(new Set(q.userAnswers))
            : ["-"];

          const maxLength = Math.max(corrects.length, users.length);

          return Array.from({ length: maxLength }).map((_, idx) => (
            <TableRow key={`${q.id}-${idx}`}>
              <TableCell>{idx === 0 ? q.content : ""}</TableCell>
              <TableCell sx={{ color: "success.main" }}>
                {corrects[idx] ?? "-"}
              </TableCell>
              <TableCell>{users[idx] ?? "-"}</TableCell>
            </TableRow>
          ));
        })}
      </TableBody>
    </Table>
  );

  return (
    <>
      {/* Pretest */}
      {pretest.length > 0 && (
        <>
          <TableRow hover>
            <TableCell>
              <IconButton size="small" onClick={() => setOpenPre(!openPre)}>
                {openPre ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
              </IconButton>
            </TableCell>
            <TableCell>
              แบบทดสอบก่อนเรียน
            </TableCell>
            <TableCell>
              {pretestScore} คะแนน / {pretest.length} คะแนน
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell colSpan={4} sx={{ p: 0 }}>
              <Collapse in={openPre} timeout="auto" unmountOnExit>
                <Box margin={1}>{renderQuestionTable(pretest)}</Box>
              </Collapse>
            </TableCell>
          </TableRow>
        </>
      )}

      {/* Posttest */}
      {posttest.length > 0 && (
        <>
          <TableRow hover>
            <TableCell>
              <IconButton size="small" onClick={() => setOpenPost(!openPost)}>
                {openPost ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
              </IconButton>
            </TableCell>
            <TableCell>
              แบบทดสอบหลังเรียน
            </TableCell>
            <TableCell>
              {posttestScore} คะแนน / {posttest.length} คะแนน
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell colSpan={4} sx={{ p: 0 }}>
              <Collapse in={openPost} timeout="auto" unmountOnExit>
                <Box margin={1}>{renderQuestionTable(posttest)}</Box>
              </Collapse>
            </TableCell>
          </TableRow>
        </>
      )}

      {/* Labs */}
      {labs.length > 0 && (
        <>
          <TableRow hover>
            <TableCell>
              <IconButton size="small" onClick={() => setOpenLab(!openLab)}>
                {openLab ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
              </IconButton>
            </TableCell>
            <TableCell>
              ปฏิบัติการทดสอบ 
            </TableCell>
            <TableCell>
              {labtestScore} คะแนน / {labs.length} คะแนน
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell colSpan={4} sx={{ p: 0 }}>
              <Collapse in={openLab} timeout="auto" unmountOnExit>
                <Box margin={1}>{renderQuestionTable(labs)}</Box>
              </Collapse>
            </TableCell>
          </TableRow>
        </>
      )}
    </>
  );
};

function CircularProgressWithLabel(props) {
  return (
    <Box sx={{ position: 'relative', display: 'inline-flex' }}>
      <CircularProgress variant="determinate" {...props} />
      <Box
        sx={{
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          position: 'absolute',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: "100%"
        }}
      >
        <Typography
          variant="caption"
          component="div"
          sx={{ color: 'text.secondary' }}
        >
          {`${Math.round(props.value)}%`}
        </Typography>
      </Box>
    </Box>
  );
}

function Row({ row }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <TableRow hover>
        <TableCell>
          <IconButton size="small" onClick={() => setOpen(!open)}>
            {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
          </IconButton>
        </TableCell>
        <TableCell>{row.userId}</TableCell>
        <TableCell>{row.user?.name ?? "N/A"}</TableCell>
        <TableCell>
          {row.progressPercent ? (
            <CircularProgressWithLabel value={row.progressPercent} />
          ):(
            <>-</>
          )}
        </TableCell>
      </TableRow>

      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box margin={2}>
              <Typography variant="h6" gutterBottom>
                รายละเอียดคำถาม
              </Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell />
                    <TableCell>คำถาม</TableCell>
                    <TableCell>คะแนน</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <GroupedProgressRow
                    progress={row.progress}
                    pretestScore={row.pretestScore}
                    posttestScore={row.posttestScore}
                    labtestScore={row.labtestScore}
                  />
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}

// ฟังก์ชันสำหรับการ sort
function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) return -1;
  if (b[orderBy] > a[orderBy]) return 1;
  return 0;
}

function getComparator(order, orderBy) {
  return order === "desc"
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function stableSort(array, comparator) {
  const stabilized = array.map((el, index) => [el, index]);
  stabilized.sort((a, b) => {
    const cmp = comparator(a[0], b[0]);
    if (cmp !== 0) return cmp;
    return a[1] - b[1];
  });
  return stabilized.map((el) => el[0]);
}

function EnrollSum() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [enrollments, setEnrollments] = useState([]);
  const [order, setOrder] = useState("asc");
  const [orderBy, setOrderBy] = useState("userId");

  const fetchSumEnrollment = async () => {
    try {
      const response = await backend.get(`/teacher/sumEnrollments/${courseId}`, {
        withCredentials: true,
      });

      if (response.status === 200) {
        setEnrollments(response.data.finalFormat || []);
        console.log("Enrollment data fetched successfully:", response.data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchSumEnrollment();
  }, [courseId]);

  const handleSort = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const tabletQuery = useMediaQuery('(max-width:720px)');

  return (
    <Stack
      gap={2}
      sx={{
        width: "80%",
        margin: "16px auto",
      }}
    >
      <Stack direction="row" justifyContent="flex-start" alignItems="center">
        {!tabletQuery ? (
          <Button
            variant="contained"
            onClick={() => navigate(-1)}
            startIcon={<KeyboardArrowLeft />}
          >
            ย้อนกลับ
          </Button>
        ):(
          <IconButton 
            sx={{
              backgroundColor: "rgb(25, 118, 210)",
              color: "white",
              "&:hover": {
                backgroundColor: "rgb(25, 118, 210)",
              },
            }}
            onClick={() => navigate(-1)}
          >
            <KeyboardArrowLeft />
          </IconButton>
        )}
        
      </Stack>

      <Typography variant="h5" sx={{ textAlign: "center" }}>
        รายชื่อนักเรียนทั้งหมด
      </Typography>

      <TableContainer component={Paper} sx={{ mt: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell />
              <TableCell sortDirection={orderBy === "userId" ? order : false}>
                <TableSortLabel
                  active={orderBy === "userId"}
                  direction={orderBy === "userId" ? order : "asc"}
                  onClick={() => handleSort("userId")}
                >
                  เลขประจำตัวนักเรียน
                </TableSortLabel>
              </TableCell>
              <TableCell sortDirection={orderBy === "name" ? order : false}>
                <TableSortLabel
                  active={orderBy === "name"}
                  direction={orderBy === "name" ? order : "asc"}
                  onClick={() => handleSort("name")}
                >
                  ชื่อนักเรียน
                </TableSortLabel>
              </TableCell>
              
              <TableCell sortDirection={orderBy === "progressPercent" ? order : false}>
                <TableSortLabel
                  active={orderBy === "progressPercent"}
                  direction={orderBy === "progressPercent" ? order : "asc"}
                  onClick={() => handleSort("progressPercent")}
                >
                  ความคืบหน้าการเรียน
                </TableSortLabel>
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {stableSort(enrollments, getComparator(order, orderBy)).map((row) => (
              <Row key={row.id} row={row} />
            ))}

            {enrollments.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography
                    variant="h6"
                    color="error.main"
                    textAlign="center"
                  >
                    ไม่พบข้อมูลนักเรียนในรายวิชานี้
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Stack>
  );
}

export default EnrollSum;
