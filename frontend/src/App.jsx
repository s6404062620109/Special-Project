import { matchPath, Route, Routes, useLocation } from 'react-router-dom'
import { useContext } from 'react';
import { AuthContext } from './context/AuthProvider';

import './App.css'

/*  */
import Navbar from './components/Navbar';
import Home from './pages/home';
import Courses from './pages/courses';
import Register from './pages/authenticate/register';
import Reset from './pages/authenticate/reset';
import CourseDetail from './pages/coursedetails';
import Subject from './pages/subject';
import Pretest from './pages/test/pre';
import PostTest from './pages/test/post';
import RenderLab from './pages/test/lab';
import SetPassword from './pages/authenticate/register/SetPassword';
import Forgot from './pages/authenticate/forgot';
import Profile from './pages/Profile';
/*  */

/* */ 
import MyCourses from './pages/teacher/MyCourses';
import EditCourse from './pages/teacher/Course';
import AddSubject from './pages/teacher/Subject';
/* */

/* */
import ManageUser from './pages/admin/manageuser';
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
      {userData.role === null &&(
        <div className='container-wrap'>      
          <div className='content'>
            <Routes>
              <Route path='/' element={<Home/>}/>
              <Route path='/register' element={<Register/>}/>
              <Route path='/set-password' element={<SetPassword/>}/>
              <Route path='/forgot-password' element={<Forgot/>}/>
              <Route path='/reset-password' element={<Reset/>}/>
              <Route path='/course/:courseId' element={<CourseDetail/>}/>
              <Route path='/courses' element={<Courses/>}/>
            </Routes>
          </div>
        </div>
      )}

      {userData.role === 's' &&(
        <div className='container-wrap'>
      
          <div className='content'>
            <Routes>
              <Route path='/' element={<Home/>}/>
              <Route path='/forgot-password' element={<Forgot/>}/>
              <Route path='/reset-password' element={<Reset/>}/>
              <Route path='/profile' element={<Profile/>}/>

              <Route path='/course/:courseId/:enrollmentId' element={<CourseDetail/>}/>
              <Route path='/courses' element={<Courses/>}/>
              <Route path='/course/:courseId/subject/:subjectId/:enrollmentId' element={<Subject/>}/>
              <Route path='/lab/:enrollmentId/question/:questionId' element={<RenderLab/>}/>
              <Route path='/course/:courseId/pretest/:enrollmentId' element={<Pretest/>}/>
              <Route path='/course/:courseId/posttest/:enrollmentId' element={<PostTest/>}/>
            </Routes>
          </div>
        </div>
      )}

      {userData.role === "t" &&(
        <div className='container-wrap'>

          <div className='content'>
            <Routes>
              <Route path='/' element={<Home/>}/>
              <Route path='/profile' element={<Profile/>}/>
              <Route path='/my-courses' element={<MyCourses/>}/>
              <Route path='/edit-course/:courseId' element={<EditCourse/>}/>
              <Route path='/add-subject/:courseId/:mode' element={<AddSubject/>}/>
            </Routes>
          </div>
        </div>
      )}

      {userData.role === "a" &&(
        <div className='container-wrap'>
          
          <div className='content'>
            <Routes>
              <Route path='/' element={<Home/>}/>
              <Route path='/profile' element={<Profile/>}/>
              <Route path='/manageUser' element={<ManageUser/>}/>
            </Routes>
          </div>
        </div>
      )}
      
    </div>
  )
}

export default App
