import { matchPath, Route, Routes, useLocation } from 'react-router-dom'
import { useContext } from 'react';
import { AuthContext } from './context/AuthProvider';

import CopyrightIcon from '@mui/icons-material/Copyright';
import './App.css'

/*  */
import Navbar from './components/Navbar';
import Home from './pages/home';
import Courses from './pages/courses';
import Register from './pages/authenticate/register';
import Reset from './pages/authenticate/reset';
import CourseDetail from './pages/coursedetails';
import Subject from './pages/subject';
import Labs from './pages/labs';
import Pretest from './pages/test/pre';
import PostTest from './pages/test/post';
import SetPassword from './pages/authenticate/register/SetPassword';
import Forgot from './pages/authenticate/forgot';
import Profile from './pages/Profile';
/*  */

/* */ 
import MyCourses from './pages/teacher/MyCourses';
import EditCourse from './pages/teacher/Course';
import AddSubject from './pages/teacher/Subject/AddSubject';
/* */

/* */
import ManageUser from './pages/admin/manageuser';
import EditSubject from './pages/teacher/Subject/EditSubject';
/* */

function App() {
  const { userData } = useContext(AuthContext);

  const location = useLocation();
  const noNavbarRoutes = [ '/lab/:enrollmentId/question/:questionId' ];
  const showNavbar = !noNavbarRoutes.some((pattern) =>
    matchPath(pattern, location.pathname)
  );

  return (
    <div className='container'>
      {showNavbar && <Navbar />}
        <div className='container-wrap'>      
          <div className='content'>
            {userData.role === null &&(
              <Routes>
                <Route path='/' element={<Home/>}/>
                <Route path='/register' element={<Register/>}/>
                <Route path='/set-password' element={<SetPassword/>}/>
                <Route path='/forgot-password' element={<Forgot/>}/>
                <Route path='/reset-password' element={<Reset/>}/>
                <Route path='/course/:courseId' element={<CourseDetail/>}/>
                <Route path='/courses' element={<Courses/>}/>
              </Routes>
            )}

            {userData.role === 's' &&(
              <Routes>
                <Route path='/' element={<Home/>}/>
                <Route path='/forgot-password' element={<Forgot/>}/>
                <Route path='/reset-password' element={<Reset/>}/>
                <Route path='/profile' element={<Profile/>}/>

                <Route path='/course/:courseId/:enrollmentId' element={<CourseDetail/>}/>
                <Route path='/courses' element={<Courses/>}/>
                <Route path='/course/:courseId/subject/:subjectId/:enrollmentId' element={<Subject/>}/>
                <Route path='/course/:courseId/pretest/:enrollmentId' element={<Pretest/>}/>
                <Route path='/course/:courseId/posttest/:enrollmentId' element={<PostTest/>}/>
                <Route path='/labs/:courseId/:subjectId/:enrollmentId' element={<Labs/>}/>
              </Routes>
            )}

            {userData.role === 't' &&(
              <Routes>
                <Route path='/' element={<Home/>}/>
                <Route path='/profile' element={<Profile/>}/>
                <Route path='/my-courses' element={<MyCourses/>}/>
                <Route path='/edit-course/:courseId' element={<EditCourse/>}/>
                <Route path='/add-subject/:courseId/:mode' element={<AddSubject/>}/>
                <Route path='/edit-subject/:courseId/:subjectId' element={<EditSubject/>}/>
              </Routes>
            )}

            {userData.role === 'a' &&(
              <Routes>
                <Route path='/' element={<Home/>}/>
                <Route path='/profile' element={<Profile/>}/>
                <Route path='/manageUser' element={<ManageUser/>}/>
              </Routes>
            )}
          </div>

          <footer>
            <div className='footerContent'>
              <p><CopyrightIcon/> Security Awareness Training</p>
              <p>Contact us: {import.meta.env.VITE_EMAIL_USER}</p>
            </div>
          </footer>
        </div>
      
    </div>
  )
}

export default App
