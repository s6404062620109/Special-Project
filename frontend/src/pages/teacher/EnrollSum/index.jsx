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
  useMediaQuery,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Snackbar,
  CircularProgress,
  FormControl,
} from "@mui/material";
import { 
  KeyboardArrowDown, 
  KeyboardArrowLeft, 
  KeyboardArrowUp, 
} from "@mui/icons-material";
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import CheckIcon from '@mui/icons-material/Check';
import ClearIcon from '@mui/icons-material/Clear';
import DeleteIcon from '@mui/icons-material/Delete';
import MuiAlert from '@mui/material/Alert';
import SchoolIcon from '@mui/icons-material/School';

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
    <Table size="small" sx={{ width: "100%" }}>
      <TableBody>
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
            <TableCell colSpan={3} sx={{ p: 0 }}>
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
            <TableCell colSpan={3} sx={{ p: 0 }}>
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
            <TableCell colSpan={3} sx={{ p: 0 }}>
              <Collapse in={openLab} timeout="auto" unmountOnExit>
                <Box margin={1}>{renderQuestionTable(labs)}</Box>
              </Collapse>
            </TableCell>
          </TableRow>
        </>
      )}
      </TableBody>
    </Table>
  );
};

function AttemptRow({ attemptData, attemptNumber, handleDeleteEnrollment }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <TableRow hover>
        <TableCell>
          <IconButton size="small" onClick={() => setOpen(!open)}>
            {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
          </IconButton>
        </TableCell>
        <TableCell >
          ครั้งที่ {attemptNumber}
        </TableCell>
        <TableCell>
          <Typography variant="body2">
            {new Date(attemptData.startat).toLocaleString("th-TH", { dateStyle: "short", timeStyle: "short" })}
          </Typography>
        </TableCell>
        <TableCell>
          { attemptData.endat ? new Date(attemptData.endat).toLocaleString("th-TH", { dateStyle: "short", timeStyle: "short" }) : "-"}
        </TableCell>
        <TableCell>
          {(() => {
            switch (attemptData.status) {
              case 1:
                return <Stack direction="row" gap={1} color="success.main">
                  <Typography variant="body2">ผ่าน</Typography> 
                  <CheckIcon fontSize="small" />
                </Stack>;
              case -1:
                return <Stack direction="row" gap={1} color="error.main">
                  <Typography variant="body2">ไม่ผ่าน</Typography> 
                  <ClearIcon fontSize="small" />
                </Stack>;
              default:
                return <Stack direction="row" gap={1} color="text.secondary">
                  <Typography variant="body2">กำลังเรียนอยู่</Typography> 
                  <SchoolIcon fontSize="small" />
                </Stack>;
            }
          })()}
        </TableCell>

        <TableCell>
          <IconButton
            onClick={() => handleDeleteEnrollment(attemptData.id)}
          >
            <DeleteIcon color="error"/>
          </IconButton>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0, borderBottom: 'unset' }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <GroupedProgressRow
              progress={attemptData.progress}
              pretestScore={attemptData.pretestScore}
              posttestScore={attemptData.posttestScore}
              labtestScore={attemptData.labtestScore}
            />
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}

function UserRow({ userGroup, handleDeleteStudentEnrollments, handleDeleteEnrollment }) {
  const [open, setOpen] = useState(false);

  const firstAttempt = userGroup.attempts[0];
  const lastAttempt = userGroup.attempts[userGroup.attempts.length - 1];

  const renderStatus = (status) => {
    if (status === undefined || status === null) return "-";
    switch (status) {
      case 1:
        return <Stack direction="row" gap={1} color="success.main" justifyContent="center">
          <Typography variant="body2">ผ่าน</Typography>
          <CheckIcon fontSize="small" />
        </Stack>;
      case -1:
        return <Stack direction="row" gap={1} color="error.main" justifyContent="center">
          <Typography variant="body2">ไม่ผ่าน</Typography>
          <ClearIcon fontSize="small" />
        </Stack>;
      default:
        return <Stack direction="row" gap={1} color="text.secondary" justifyContent="center">
          <Typography variant="body2">กำลังเรียนอยู่</Typography>
          <SchoolIcon fontSize="small" />
        </Stack>;
    }
  };


  return (
    <>
      <TableRow hover>
        <TableCell>
          <IconButton size="small" onClick={() => setOpen(!open)}>
            {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
          </IconButton>
        </TableCell>
        <TableCell>{userGroup.userId}</TableCell>
        <TableCell>{userGroup.name}</TableCell>
        <TableCell align="center">{userGroup.attempts.length}</TableCell>
        <TableCell align="center">{renderStatus(firstAttempt?.status)}</TableCell>
        <TableCell align="center">{renderStatus(lastAttempt?.status)}</TableCell>
        <TableCell align="center">
          <IconButton
            onClick={() => handleDeleteStudentEnrollments(userGroup.userId)}
          >
            <DeleteIcon color="error" />
          </IconButton>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={7}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box margin={1}>
              <Typography variant="h6" gutterBottom component="div" sx={{ ml: 2, mt: 1 }}>
                ประวัติการลงทะเบียน
              </Typography>
              <Table size="small" aria-label="attempts">
                <TableHead>
                  <TableRow>
                    <TableCell />
                    <TableCell sx={{ width: '20%' }}>การลงทะเบียน</TableCell>
                    <TableCell sx={{ width: '20%' }}>วันที่เริ่มเรียน</TableCell>
                    <TableCell sx={{ width: '20%' }}>วันที่สิ้นสุดการเรียน</TableCell>
                    <TableCell sx={{ width: '20%' }}>สถานะ</TableCell>
                    <TableCell sx={{ width: "10%" }}>ลบประวัติ</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {userGroup.attempts.map((attempt, index) => (
                    <AttemptRow
                      key={attempt.id}
                      attemptData={attempt}
                      attemptNumber={index + 1}
                      handleDeleteEnrollment={handleDeleteEnrollment}
                    />
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

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const ConfirmationDialog = ({ open, onClose, onConfirm, title, description }) => (
  <Dialog open={open} onClose={onClose}>
    <DialogTitle>{title}</DialogTitle>
    <DialogContent><DialogContentText>{description}</DialogContentText></DialogContent>
    <DialogActions>
      <Button onClick={onClose}>ยกเลิก</Button>
      <Button onClick={onConfirm} color="error" autoFocus>ยืนยัน</Button>
    </DialogActions>
  </Dialog>
);

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
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateRange, setDateRange] = useState({ startDate: "", endDate: "" });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogContent, setDialogContent] = useState({ title: '', description: '', onConfirm: null });
  const [exporting, setExporting] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const fetchSumEnrollment = async () => {
    try {
      const response = await backend.get(`/teacher/sumEnrollments/${courseId}`, {
        withCredentials: true,
      });

      if (response.status === 200) {
        setEnrollments(response.data.finalFormat || []);
      }
    } catch (error) {
      console.error(error);
      if (error.response && error.response.data.message === "No enrollment found.") {
        setEnrollments([]);
      }
    }
  };

  const openDeleteDialog = ({ title, description, onConfirm }) => {
    setDialogContent({ title, description, onConfirm });
    setDialogOpen(true);
  };

  const handleDeleteEnrollment = async (id) => {
    openDeleteDialog({
      title: "ยืนยันการลบประวัติการเรียน",
      description: "คุณแน่ใจหรือไม่ว่าต้องการลบประวัติการเรียนครั้งนี้? การกระทำนี้ไม่สามารถย้อนกลับได้",
      onConfirm: async () => {
        setDialogOpen(false);
        try {
          const response = await backend.delete(`/teacher/deleteEnrollment/${courseId}/${id}`, { withCredentials: true });
          if (response.status === 200) {
            setSnackbar({ open: true, message: response.data.message, severity: 'success' });
            fetchSumEnrollment();
          }
        } catch (error) { 
          setSnackbar({ open: true, message: 'เกิดข้อผิดพลาดในการลบ', severity: 'error' });
          console.log(error); 
        }
      },
    });
  };

  const handleDeleteStudentEnrollments = async (userId) => {
    openDeleteDialog({
      title: "ยืนยันการลบผู้เรียน",
      description: `คุณแน่ใจหรือไม่ว่าต้องการลบประวัติการเรียนทั้งหมดของผู้เรียนคนนี้? การกระทำนี้ไม่สามารถย้อนกลับได้`,
      onConfirm: async () => {
        setDialogOpen(false);
        try {
          const response = await backend.delete(`/teacher/deleteStudentEnrollments/${courseId}/${userId}`, { withCredentials: true });
          if (response.status === 200) {
            setSnackbar({ open: true, message: response.data.message, severity: 'success' });
            fetchSumEnrollment();
          }
        } catch (error) { 
          setSnackbar({ open: true, message: 'เกิดข้อผิดพลาดในการลบ', severity: 'error' });
          console.log(error); 
        }
      },
    });
  };

  const groupedEnrollments = React.useMemo(() => {
    if (!enrollments.length) return [];

    const byUser = enrollments.reduce((acc, enrollment) => {
      const userId = enrollment.userId;
      if (!acc[userId]) {
        acc[userId] = {
          userId: userId,
          name: enrollment.user?.name ?? "N/A",
          attempts: [],
        };
      }
      acc[userId].attempts.push(enrollment);
      return acc;
    }, {});

    return Object.values(byUser).map(userGroup => ({
      ...userGroup,
      attempts: userGroup.attempts.sort((a, b) => a.id - b.id),
    }));
  }, [enrollments]);

  const filteredAndSortedEnrollments = React.useMemo(() => {
    let filteredByUser = groupedEnrollments;

    // 1. Filter by user name/ID
    if (searchQuery) {
      const lowercasedQuery = searchQuery.toLowerCase();
      filteredByUser = groupedEnrollments.filter(userGroup =>
        userGroup.name.toLowerCase().includes(lowercasedQuery) ||
        String(userGroup.userId).toLowerCase().includes(lowercasedQuery)
      );
    }

    // 2. Filter attempts within each user group by date and status
    const filteredByContent = filteredByUser.map(userGroup => {
      const filteredAttempts = userGroup.attempts.filter(attempt => {
        // Status filter
        const statusMatch = statusFilter === "all" || attempt.status === statusFilter;

        // Date range filter
        const attemptStartDate = new Date(attempt.startat);
        const attemptEndDate = attempt.endat ? new Date(attempt.endat) : null;
        const filterStartDate = dateRange.startDate ? new Date(dateRange.startDate) : null;
        const filterEndDate = dateRange.endDate ? new Date(dateRange.endDate) : null;

        if (filterEndDate) filterEndDate.setHours(23, 59, 59, 999); // Set to end of day

        const startDateMatch = !filterStartDate || attemptStartDate >= filterStartDate;
        const endDateMatch = !filterEndDate || (attemptEndDate && attemptEndDate <= filterEndDate);

        return statusMatch && startDateMatch && endDateMatch;
      });

      return { ...userGroup, attempts: filteredAttempts };
    }).filter(userGroup => userGroup.attempts.length > 0); // 3. Remove users with no matching attempts


    return stableSort(filteredByContent, getComparator(order, orderBy));
  }, [groupedEnrollments, searchQuery, order, orderBy, statusFilter, dateRange]);

  useEffect(() => {
    fetchSumEnrollment();
  }, [courseId]);

  const handleSort = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange(prev => ({ ...prev, [name]: value }));
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setDateRange({ startDate: "", endDate: "" });
  };

  const handleExportCSV = () => {
    if (filteredAndSortedEnrollments.length === 0) {
      setSnackbar({ open: true, message: 'ไม่มีข้อมูลสำหรับส่งออก', severity: 'warning' });
      return;
    }
    setExporting(true);

    const headers = [
      "เลขประจำตัวนักเรียน", "ชื่อนักเรียน", "ครั้งที่เรียน",
      "วันที่เริ่มเรียน", "วันที่สิ้นสุดการเรียน", "สถานะ",
      "คะแนนก่อนเรียน", "คะแนนหลังเรียน", "คะแนนปฏิบัติการ"
    ];

    const statusText = { 1: "ผ่าน", 0: "กำลังเรียนอยู่", "-1": "ไม่ผ่าน" };

    const rows = filteredAndSortedEnrollments.flatMap(userGroup =>
      userGroup.attempts.map((attempt, attemptIndex) => [
        userGroup.userId,
        `"${userGroup.name}"`,
        attemptIndex + 1,
        new Date(attempt.startat).toLocaleString("th-TH"),
        attempt.endat ? new Date(attempt.endat).toLocaleString("th-TH") : "-",
        statusText[attempt.status] || "ไม่ทราบ",
        attempt.pretestScore,
        attempt.posttestScore,
        attempt.labtestScore
      ])
    );

    const csvContent = [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const bom = "\uFEFF"; // BOM for UTF-8 to support Thai characters in Excel
    const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `enrollment_summary_${courseId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setExporting(false);
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
        
        <ConfirmationDialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          onConfirm={dialogContent.onConfirm}
          title={dialogContent.title}
          description={dialogContent.description}
        />

        <Snackbar 
          open={snackbar.open} 
          autoHideDuration={6000} 
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Stack>

      <Typography variant="h5" sx={{ textAlign: "center" }}>
        รายชื่อนักเรียนทั้งหมด
      </Typography>

      <Stack 
        direction={tabletQuery ? "column" : "row"} 
        spacing={2}
        alignItems="center"
      >
        <TextField
          label="ค้นหาตามชื่อ หรือ เลขประจำตัว"
          variant="outlined"
          fullWidth
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{
            width: "100%"
          }}
        />

        <Stack
          direction="row"
          spacing={2}
          alignItems="center"
          sx={{ width: tabletQuery ? "100%" : "60%" }}
        >
          <TextField
            label="วันที่เริ่มเรียน (ตั้งแต่)"
            type="date"
            name="startDate"
            value={dateRange.startDate}
            onChange={handleDateChange}
            slotProps={{ inputLabel: { shrink: true } }}
            sx={{ minWidth: "30%" }}
          />

          <TextField
            label="วันที่สิ้นสุด (ถึง)"
            type="date"
            name="endDate"
            value={dateRange.endDate}
            onChange={handleDateChange}
            slotProps={{ inputLabel: { shrink: true } }}
            sx={{ minWidth: "30%" }}
          />
            
          <FormControl sx={{ minWidth: "30%" }}>
            <InputLabel id="status-filter-label">สถานะ</InputLabel>
            <Select
              labelId="status-filter-label"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              label="สถานะ"
            >
              <MenuItem value="all">ทั้งหมด</MenuItem>
              <MenuItem value={1}>ผ่าน</MenuItem>
              <MenuItem value={-1}>ไม่ผ่าน</MenuItem>
              <MenuItem value={0}>กำลังเรียนอยู่</MenuItem>
            </Select>
          </FormControl>
        </Stack>
        
         <Button 
            variant="contained" 
            onClick={handleResetFilters}
            sx={{ 
              width: tabletQuery ? "100%" : "auto",
              height: "40px"
            }}
          >
            Clear
          </Button>
      </Stack>

      <Stack 
        sx={{
          flexDirection: { xs: "column", md: "row" },
          justifyContent: "space-between" ,
          alignItems: "center",
          gap: 2
        }}
      >
        <Button
          variant="contained"
          color="secondary"
          startIcon={exporting ? <CircularProgress size={20} color="inherit" /> : <FileDownloadIcon />}
          onClick={handleExportCSV}
          disabled={exporting || filteredAndSortedEnrollments.length === 0}
          sx={{
            width: { xs: "100%", md: 200 },
            mb: tabletQuery ? 1 : 0
          }}
        >
          {exporting ? "กำลังส่งออก..." : "ดาวโหลดไฟล์ CSV"}
        </Button>

        <Typography variant="body1">
          ผลลัพธ์: {filteredAndSortedEnrollments.length} คน
        </Typography>
      </Stack>


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
              
              <TableCell align="center" sortDirection={orderBy === "attempts" ? order : false}>
                <TableSortLabel
                  active={orderBy === "attempts"}
                  direction={orderBy === "attempts" ? order : "asc"}
                  onClick={() => handleSort("attempts")}
                >
                  จำนวนครั้งที่เรียน
                </TableSortLabel>
              </TableCell>

              <TableCell align="center">
                  การเรียนครั้งแรก
              </TableCell>

              <TableCell align="center">
                  การเรียนล่าสุด
              </TableCell>

              <TableCell align="center" sortDirection={orderBy === "attempts" ? order : false}>
                <TableSortLabel>
                  ลบผู้เรียน
                </TableSortLabel>
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {filteredAndSortedEnrollments.map((userGroup) => (
              <UserRow 
                key={userGroup.userId} 
                userGroup={userGroup} 
                handleDeleteStudentEnrollments={handleDeleteStudentEnrollments}
                handleDeleteEnrollment={handleDeleteEnrollment}
              />
            ))}

            {filteredAndSortedEnrollments.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center">
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
