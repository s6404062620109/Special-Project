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
          label="อีเมล"
          type="email"
          fullWidth
          margin="dense"
          value={newUser.email}
          onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
        />

        <TextField
          label="รหัสผ่าน"
          type="password"
          fullWidth
          margin="dense"
          value={newUser.password}
          onChange={(e) =>
            setNewUser({ ...newUser, password: e.target.value })
          }
        />

        <TextField
          label="ชื่อ"
          fullWidth
          margin="dense"
          value={newUser.name}
          onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
        />
        <TextField
          label="นามสกุล"
          fullWidth
          margin="dense"
          value={newUser.surname}
          onChange={(e) => setNewUser({ ...newUser, surname: e.target.value })}
        />
        <Typography variant="body2" sx={{ color: "text.secondary", mt: 1 }}>
          เพศ
        </Typography>
        <Select
          fullWidth
          margin="dense"
          value={newUser.sex}
          onChange={(e) => setNewUser({ ...newUser, sex: e.target.value })}
        >
          <MenuItem value="m">ชาย</MenuItem>
          <MenuItem value="f">หญิง</MenuItem>
          <MenuItem value="n">ไม่ระบุ</MenuItem>
        </Select>


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