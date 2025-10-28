import React, { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import backend from '../../api/backend';
import { AuthContext } from '../../context/AuthProvider';

import style from './css/courses.module.css'
import CourseCard from '../../components/CourseCard';
import { Grid ,Stack, Typography, TextField, Autocomplete, ToggleButtonGroup, ToggleButton, Pagination } from '@mui/material';

const NO_TAG_OPTION = { id: -1, name: 'ไม่มีแท็ก' };

function Courses() {
  const { userData } = useContext(AuthContext);
  const [ progress, setProgress ] = useState([]);
  const [ originalCourses, setOriginalCourses ] = useState([]);
  const [ filteredCourses, setFilteredCourses ] = useState([]);
  const [ allTags, setAllTags ] = useState([]);
  const navigate = useNavigate();
  const [ searchTerm, setSearchTerm ] = useState('');
  const [ selectedTags, setSelectedTags ] = useState([]);
  const [ enrollmentFilter, setEnrollmentFilter ] = useState('all'); // 'all', 'enrolled', 'not_enrolled'

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const coursesPerPage = 10;

  const fetchData = async () => {
    try {
      const response = await backend.get('/courses/getCourses');

      if(response.status === 200){
        setOriginalCourses(response.data.results);
        setFilteredCourses(response.data.results);
        setAllTags([NO_TAG_OPTION, ...response.data.allTags]);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const fetchProgress = async () => {
    try {
      const response = await backend.get(`/enroll/checkCoursesEnroll/${userData.id}`, {
        withCredentials: true,
      });

      if (response.status===200){
        const latestEnrollmentsMap = new Map();
        response.data.results.forEach(enrollment => {
          const existing = latestEnrollmentsMap.get(enrollment.courseId);
          if (!existing || enrollment.id > existing.id) {
            latestEnrollmentsMap.set(enrollment.courseId, enrollment);
          }
        });

        const uniqueLatestEnrollments = Array.from(latestEnrollmentsMap.values());
        setProgress(uniqueLatestEnrollments);
      }
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    fetchData();

    if(userData.id){
      fetchProgress();
    }
  }, []);

  useEffect(() => {
    let courses = [...originalCourses];

    if (userData.id && enrollmentFilter !== 'all') {
      const enrolledCourseIds = new Set(progress.map(p => p.courseId));
      if (enrollmentFilter === 'enrolled') {
        courses = courses.filter(course => enrolledCourseIds.has(course.id));
      } else if (enrollmentFilter === 'not_enrolled') {
        courses = courses.filter(course => !enrolledCourseIds.has(course.id));
      }
    }

    if (searchTerm) {
      courses = courses.filter(course =>
        course.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedTags.length > 0) {
      const hasNoTagFilter = selectedTags.some(t => t.id === NO_TAG_OPTION.id);
      const regularTagIds = new Set(
        selectedTags.filter(t => t.id !== NO_TAG_OPTION.id).map(t => t.id)
      );

      courses = courses.filter(course =>{
        if (hasNoTagFilter && (!course.tags || course.tags.length === 0)) {
          return true;
        }
        if (regularTagIds.size > 0 && course.tags?.some(tag => regularTagIds.has(tag.id))) {
          return true;
        }
        return false;
      });
    }

    setFilteredCourses(courses);
    // Reset to first page whenever filters change
    setCurrentPage(1); 
  }, [searchTerm, selectedTags, originalCourses, enrollmentFilter, progress, userData.id]);

  // Pagination Logic
  const indexOfLastCourse = currentPage * coursesPerPage;
  const indexOfFirstCourse = indexOfLastCourse - coursesPerPage;
  const currentCourses = filteredCourses.slice(indexOfFirstCourse, indexOfLastCourse);
  const pageCount = Math.ceil(filteredCourses.length / coursesPerPage);

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
    window.scrollTo(0, 0); // Scroll to top on page change
  };

  return (
    <div className={style.pageWrapper}>
      <div className={style.content}>
        <div className={style.head}>
          <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold' }}>
            คอร์สเรียนทั้งหมด
          </Typography>
        </div>

        <Stack
          direction="column"
          spacing={2}
          sx={{ 
            width: '100%', 
            mb: 2, 
            justifyContent: 'center',
            alignItems: 'center' 
          }}
        >
          <TextField
            variant="outlined"
            placeholder="ค้นหาด้วยชื่อคอร์ส..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ width: { xs: '90%', md: '60%' }, bgcolor: 'white' }}
          />
          
          <Autocomplete
            multiple
            id="tags-filter"
            options={allTags}
            getOptionLabel={(option) => option.name}
            value={selectedTags}
            onChange={(event, newValue) => {
              setSelectedTags(newValue);
            }}
            sx={{ 
              width: { xs: '90%', md: '60%' },
              bgcolor: 'white' 
            }}
            renderInput={(params) => (
              <TextField {...params} variant="outlined" label="กรองด้วยแท็ก" />
            )}
          />
        </Stack>

        <Stack
          direction={{ xs: "column-reverse", md: "row" }}
          gap={2}
          sx={{
            width: "80%"
          }}
        >
          <Typography variant="body1" color="text.secondary" sx={{ width: { xs: "90%", md: "80%" }, textAlign: 'left', mb: 2 }}>
            {`พบ ${filteredCourses.length} คอร์ส`}
          </Typography>

          {userData.id && (
            <ToggleButtonGroup
              color="primary"
              value={enrollmentFilter}
              exclusive
              onChange={(event, newFilter) => {
                if (newFilter !== null) {
                  setEnrollmentFilter(newFilter);
                }
              }}
              aria-label="Enrollment Filter"
              sx={{ 
                bgcolor: 'white', 
                boxShadow: 1 
              }}
              fullWidth
            >
              <ToggleButton value="all">ทั้งหมด</ToggleButton>
              <ToggleButton value="enrolled">เรียนแล้ว</ToggleButton>
              <ToggleButton value="not_enrolled">ยังไม่ได้เรียน</ToggleButton>
            </ToggleButtonGroup>
          )}
        </Stack>


        <Stack
          sx={{
            width: { xs: "100%", md: "80%" },
            margin: "16px 0",
            gap: 2
          }}
        >
          {currentCourses.length > 0 ? (
            currentCourses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                onClick={() => {
                  const userEnrollment = progress.find(p => p.courseId === course.id);
                  const path = userEnrollment ? `/course/${course.id}/${userEnrollment.id}` : `/course/${course.id}/null`;
                  if (userData.id){
                    navigate(path);
                  }else {
                    navigate(`/course/${course.id}`)
                  }
                }}
              />
            ))
          ) : (
            <Typography sx={{ width: '100%', textAlign: 'center', mt: 4 }}>
              ไม่พบคอร์สเรียนที่ตรงกับเงื่อนไข
            </Typography>
          )}

          {pageCount > 1 && (
            <Stack 
              sx={{ 
                width: "100%",
                mt: 3 
              }}
            >
              <Pagination
                count={pageCount}
                page={currentPage}
                onChange={handlePageChange}
                color="primary"
                sx={{ display: 'flex', justifyContent: 'center' }}
              />
            </Stack>
          )}
        </Stack>
      </div>
    </div>
  )
}

export default Courses