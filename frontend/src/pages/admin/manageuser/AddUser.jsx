import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  Button,
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
      <DialogTitle>Add New User</DialogTitle>
      <DialogContent>
        <TextField
          label="Name"
          fullWidth
          margin="dense"
          value={newUser.name}
          onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
        />
        <TextField
          label="Email"
          type="email"
          fullWidth
          margin="dense"
          value={newUser.email}
          onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
        />
        <Select
          fullWidth
          margin="dense"
          value={newUser.role}
          onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
        >
          <MenuItem value="s">Student</MenuItem>
          <MenuItem value="t">Teacher</MenuItem>
          <MenuItem value="a">Admin</MenuItem>
        </Select>
        {message.text && (
          <p style={{ color: message.status === "success" ? "green" : "red" }}>
            {message.text}
          </p>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onSubmit} variant="contained">
          Add
        </Button>
        <Button onClick={onClose} color="error">
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default AddUser