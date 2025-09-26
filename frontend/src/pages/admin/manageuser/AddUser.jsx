import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  Button,
  Typography,
} from "@mui/material";

function AddUser({ 
    open, 
    onClose, 
    newUser, 
    setNewUser, 
    onSubmit, 
    message 
}) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>เพิ่มนักเรียนใหม่</DialogTitle>
      <DialogContent>
        <TextField
          label="ซื่อ"
          fullWidth
          margin="dense"
          value={newUser.name}
          onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
        />
        <TextField
          label="อีเมล"
          type="email"
          fullWidth
          margin="dense"
          value={newUser.email}
          onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
        />
        <Typography variant="body2" sx={{ color: "text.secondary" }}>ตำแหน่ง</Typography>
        <Select
          fullWidth
          margin="dense"
          value={newUser.role}
          onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
        >
          <MenuItem value="s">นักเรียน</MenuItem>
          <MenuItem value="t">อาจารย์</MenuItem>
          <MenuItem value="a">ผู้ดูแลระบบ</MenuItem>
        </Select>
        {message.text && (
          <p style={{ color: message.status === "success" ? "green" : "red" }}>
            {message.text}
          </p>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onSubmit} variant="contained">
          ยืนยัน
        </Button>
        <Button onClick={onClose} color="error">
          ยกเลิก
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default AddUser