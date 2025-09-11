import { Stack, Typography } from "@mui/material";

function TeacherData({ name, email, profile_img = null }) {
  return (
    <Stack
      direction="column"
      justifyContent="center"
      alignItems="center"
      gap={2}
    >
        <Typography variant="h6">
            อาจารย์ผู้สอน
        </Typography>
        
        <Stack
            direction="row"
            justifyContent="center"
            alignItems="center"
            gap={2}
        >
            <img
                alt="Teacher Profile Image"
                src={
                    profile_img !== null ? profile_img : "/Navbar_Assets/Profile.png"
                }
            />

            <Stack 
                direction="column" 
                justifyContent="center" 
                alignItems="flex-start"
            >
                <Typography variant="h6">{name}</Typography>
                <Typography variant="body1">{email}</Typography>
            </Stack>
        </Stack>
    </Stack>
  );
}

export default TeacherData;
