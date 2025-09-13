import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
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
} from "@mui/material";
import { KeyboardArrowDown, KeyboardArrowUp } from "@mui/icons-material";

function ProgressRow({ prog }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <TableRow hover>
        <TableCell>
          <IconButton size="small" onClick={() => setOpen(!open)}>
            {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
          </IconButton>
        </TableCell>
        <TableCell>{prog.questions[0]?.content ?? "N/A"}</TableCell>
        <TableCell>{prog.score ?? "-"}</TableCell>
        <TableCell>{prog.is_completed ? "✅" : "❌"}</TableCell>
      </TableRow>

      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={4}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box margin={1}>
              <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                คำตอบที่ถูก:
              </Typography>
              <Typography variant="body1" color="success.main">
                {prog.questions[0]?.answer ?? "N/A"}
              </Typography>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
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
        <TableCell>{row.completed_labs}</TableCell>
        <TableCell>{row.total_labs}</TableCell>
      </TableRow>

      {/* Collapsible Progress */}
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
                    <TableCell>สถานะ</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {row.progress.map((prog) => (
                    <ProgressRow key={prog.id} prog={prog} />
                  ))}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}

function EnrollSum() {
  const { courseId } = useParams();
  const [enrollments, setEnrollments] = useState([]);

  const fetchSumEnrollment = async () => {
    try {
      const response = await backend.get(`/teacher/sumEnrollments/${courseId}`, {
        withCredentials: true,
      });
      setEnrollments(response.data.finalFormat || []);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchSumEnrollment();
  }, [courseId]);

  return (
    <Box sx={{ width: "80%", margin: "0 auto" }}>
      <TableContainer component={Paper} sx={{ mt: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell />
              <TableCell>เลขประจำตัวนักเรียน</TableCell>
              <TableCell>ชื่อนักเรียน</TableCell>
              <TableCell>ปฏิบัติการทดลองที่ผ่าน</TableCell>
              <TableCell>จำนวนปฏิบัติการทดลองทั้งหมด</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {enrollments.map((row) => (
              <Row key={row.id} row={row} />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

export default EnrollSum;
