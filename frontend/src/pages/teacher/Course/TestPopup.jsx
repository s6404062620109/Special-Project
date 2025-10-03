import { useNavigate, useParams } from 'react-router-dom';

import { Button, Dialog, DialogActions, DialogTitle, Stack } from '@mui/material'
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

function TestPopup({
    examDialogOpen,
    setExamDialogOpen,
}) {
    const { courseId } = useParams();
    const navigate = useNavigate();

  return (
    <Dialog
        open={examDialogOpen}
        onClose={() => setExamDialogOpen(false)}
        aria-labelledby="exam-dialog-title"
        slotProps={{
            paper: {
            sx: {
                borderRadius: "12px",
                padding: "20px",
                boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
                backgroundColor: "white",
            },
            },
        }}
        >
        <DialogTitle id="exam-dialog-title">
            คุณต้องการทำอะไรกับคลังข้อสอบ?
        </DialogTitle>

        <DialogActions sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <Stack
                direction={{ xs: "column", sm: "row" }}
                sx={{
                    width: "100%",
                    gap: 2
                }}
            >
                <Button
                    variant="contained"
                    fullWidth
                    startIcon={<AddIcon />}
                    onClick={() => {
                        setExamDialogOpen(false);
                        navigate(`/exam/add/${courseId}`);
                    }}
                    sx={{
                        backgroundColor: "#2e9b33ff",
                    }}
                >
                    เพิ่มข้อสอบ
                </Button>
                <Button
                    variant="contained"
                    fullWidth
                    startIcon={<EditIcon />}
                    onClick={() => {
                        setExamDialogOpen(false);
                        navigate(`/exam/edit/${courseId}`);
                    }}
                >
                    แก้ไขข้อสอบ
                </Button>
                <Button
                    variant="contained"
                    color="error"
                    fullWidth
                    startIcon={<DeleteIcon />}
                    onClick={() => {
                        setExamDialogOpen(false);
                        navigate(`/exam/delete/${courseId}`);
                    }}
                    >
                    ลบข้อสอบ
                </Button>
            </Stack>
        </DialogActions>
    </Dialog>
  )
}

export default TestPopup