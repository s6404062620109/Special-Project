import React, { useState, useRef, useLayoutEffect } from 'react';
import { Card, CardActionArea, CardContent, Typography, Chip, Stack, Box, Avatar, Button } from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';

function CourseCard({ course, onClick }) {
  // ใช้ Default values เพื่อป้องกัน error หาก props ไม่มีค่า
  const { name = 'Untitled Course', discription = 'No description available.', icon, tags = [] } = course;
  const [showAllTags, setShowAllTags] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [isDescriptionOverflowing, setIsDescriptionOverflowing] = useState(false);
  const descriptionRef = useRef(null);

  useLayoutEffect(() => {
    const element = descriptionRef.current;
    if (element) {
      // ตรวจสอบว่าเนื้อหาสูงกว่ากล่องที่แสดงหรือไม่
      if (element.scrollHeight > element.clientHeight) {
        setIsDescriptionOverflowing(true);
      }
    }
  }, [discription]);

  return (
    <Card 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        border: '1px solid rgba(0, 0, 0, 0.12)',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)', 
        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 6,
        }
      }}
    >
      <CardActionArea onClick={onClick} sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, justifyContent: 'flex-start', p: 2 }}>
        <CardContent sx={{ flexGrow: 1, width: '100%', display: 'flex', flexDirection: 'column', p: 0 }}>
          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1.5 }}>
            <Avatar src={icon} sx={{ width: 40, height: 40, bgcolor: 'primary.main' }}>
              {!icon && <SchoolIcon />}
            </Avatar>
            <Typography gutterBottom variant="h6" component="div" noWrap title={name} sx={{ mb: 0 }}>
              {name}
            </Typography>
          </Stack>
          <Typography 
            variant="body2" 
            color="text.secondary"
            ref={descriptionRef}
            title={discription}
            sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: showFullDescription ? 'block' : '-webkit-box',
              WebkitLineClamp: showFullDescription ? 'none' : '2',
              WebkitBoxOrient: showFullDescription ? 'unset' : 'vertical',
              mb: 2,
            }}
          >
            {discription ? discription : "-"}
          </Typography>
          {isDescriptionOverflowing && (
            <Button
              size="small"
              onClick={(e) => {
                e.stopPropagation(); // ป้องกันไม่ให้ CardActionArea ทำงาน
                setShowFullDescription(!showFullDescription);
              }}
              sx={{
                textTransform: 'none',
                fontSize: '0.75rem',
                p: '2px 4px',
                minWidth: 'auto',
                lineHeight: 1.2,
                alignSelf: 'flex-start',
                mb: 1,
              }}
            >
              {showFullDescription ? 'ซ่อน' : 'แสดงเพิ่มเติม'}
            </Button>
          )}
          
          <Box sx={{ mt: 'auto' }}>
            {tags.length > 0 && (
              <Stack direction="row" spacing={0.5} useFlexGap flexWrap="wrap" alignItems="center">
                {(showAllTags ? tags : tags.slice(0, 5)).map((tag) => (
                  <Chip key={tag.id} label={tag.name} color="primary" size="small" />
                ))}
                {tags.length > 5 && (
                  <Button
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowAllTags(!showAllTags);
                    }}
                    sx={{
                      textTransform: 'none',
                      fontSize: '0.75rem',
                      p: '2px 4px',
                      minWidth: 'auto',
                      lineHeight: 1.2,
                    }}
                  >
                    {showAllTags ? 'ซ่อน' : `+${tags.length - 5} เพิ่มเติม`}
                  </Button>
                )}
              </Stack>
            )}
            {tags.length === 0 && (
                <Typography variant="subtitle1" color='text.secondary'>ไม่มีแท็ก</Typography>
            )}
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

export default CourseCard;