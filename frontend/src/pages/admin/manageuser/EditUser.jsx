import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  Button,
  Stack,
} from "@mui/material";

function EditUser({
  open,
  onClose,
  selectedUser,
  setSelectedUser,
  onSubmit,
  selectedImage,
  handleImageChange,
  currentProfileImg,
  message,
}) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>Edit User</DialogTitle>
      <DialogContent>
        <Stack 
          direction="column" 
          justifyContent="center" 
          alignItems="center" 
          style={{ textAlign: "center", marginBottom: "1rem" }}
        >
          {currentProfileImg || selectedImage ? (
            <img
              src={selectedImage || currentProfileImg}
              alt="Profile"
              style={{ width: 100, height: 100, borderRadius: "50%" }}
            />
          ) : (
            <div
              style={{
                width: 100,
                height: 100,
                borderRadius: "50%",
                background: "#ddd",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              No Image
            </div>
          )}
          <input
            accept="image/*"
            style={{ display: "none" }}
            id="upload-button"
            type="file"
            onChange={handleImageChange}
          />
          <label htmlFor="upload-button">
            <Button variant="outlined" component="span" style={{ marginTop: 8 }}>
              Upload Image
            </Button>
          </label>
        </Stack>

        <TextField
          label="Name"
          fullWidth
          margin="dense"
          value={selectedUser.name}
          onChange={(e) =>
            setSelectedUser({ ...selectedUser, name: e.target.value })
          }
        />
        <TextField
          label="Email"
          type="email"
          fullWidth
          margin="dense"
          value={selectedUser.email}
          onChange={(e) =>
            setSelectedUser({ ...selectedUser, email: e.target.value })
          }
        />
        <Select
          fullWidth
          margin="dense"
          value={selectedUser.role}
          onChange={(e) =>
            setSelectedUser({ ...selectedUser, role: e.target.value })
          }
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
          Save
        </Button>
        <Button onClick={onClose} color="error">
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default EditUser