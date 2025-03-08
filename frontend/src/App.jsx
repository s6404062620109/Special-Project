import { matchPath, Route, Routes, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react';
import backend from './api/backend';

import './App.css'

import Navbar from './components/Navbar';

/*  */
import Home from './pages/home';
import Courses from './pages/courses';
import Register from './pages/authenticate/register';
import Reset from './pages/authenticate/reset';
import CourseDetail from './pages/coursedetails';
import Subject from './pages/subject';
import Pretest from './pages/test/pre';
import PostTest from './pages/test/post';
import RenderLab from './pages/test/lab';
import SetPassword from './pages/authenticate/register/Setpassword';
import Forgot from './pages/authenticate/forgot';
/*  */

/* */ 
import NavbarTeach from './components/NavbarTeach';
import MyCourses from './pages/teacher/MyCourses';
import EditCourse from './pages/teacher/EditCourse';
import AddSubject from './pages/teacher/AddSubject';
/* */

/* */
import NavbarAdmin from './components/NavbarAdmin';
import ManageUser from './pages/admin/manageuser';
/* */

function App() {
  const [userData, setUserData] = useState({
      id:null,
      email:null,
      name:null,
      role:null,
      profile_img:null,
  });
  const emailrefStorage = localStorage.getItem("email");
  const location = useLocation();

  useEffect(() => {
    const fetchUserData = async () => {

      try{
        const response = await backend.get(`/auth/authorization/${emailrefStorage}`, {
          withCredentials: true
        });
        if(response.status === 200){
          setUserData({
            id:response.data.id,
            email:response.data.email,
            name:response.data.name,
            role:response.data.role,
            profile_img:response.data.profile_img,
          });
        }

      } catch(error){
        console.log(error);
        if(error.response.status === 403){
          localStorage.removeItem('email');
          alert(response.data.message);
          window.location.href = '/';
        }
      }
      
    }
    fetchUserData();
  },[emailrefStorage]);

  const noNavbarRoutes = [ '/lab/question/:questionId' ];
  const showNavbar = !noNavbarRoutes.some((pattern) =>
    matchPath(pattern, location.pathname)
  );

  return (
    <div className='container'>
      {userData.role === null &&(
        <div className='container-wrap'>
          {showNavbar && <Navbar />}
      
          <div className='content'>
            <Routes>
              <Route path='/' element={<Home/>}/>
              <Route path='/register' element={<Register/>}/>
              <Route path='/set-password' element={<SetPassword/>}/>
              <Route path='/forgot-password' element={<Forgot/>}/>
              <Route path='/reset-password' element={<Reset/>}/>
              <Route path='/course/:courseId' element={<CourseDetail/>}/>

              <Route path='/courses' element={<Courses/>}/>
              <Route path='/course/:courseId' element={<CourseDetail/>}/>
            </Routes>
          </div>
        </div>
      )}

      {userData.role === 's' &&(
        <div className='container-wrap'>
          {showNavbar && <Navbar />}
      
          <div className='content'>
            <Routes>
              <Route path='/' element={<Home/>}/>
              <Route path='/forgot-password' element={<Forgot/>}/>
              <Route path='/reset-password' element={<Reset/>}/>

              <Route path='/course/:courseId/:enrollmentId' element={<CourseDetail/>}/>
              <Route path='/courses' element={<Courses/>}/>
              <Route path='/course/:courseId/subject/:subjectId/:enrollmentId' element={<Subject/>}/>
              <Route path='/lab/question/:questionId' element={<RenderLab/>}/>
              <Route path='/course/:courseId/pretest/:enrollmentId' element={<Pretest/>}/>
              <Route path='/course/:courseId/posttest/:enrollmentId' element={<PostTest/>}/>
            </Routes>
          </div>
        </div>
      )}

      {userData.role === "t" &&(
        <div className='container-wrap'>
          <NavbarTeach/>

          <div className='content'>
            <Routes>
              <Route path='/' element={<Home/>}/>
              <Route path='/my-courses' element={<MyCourses/>}/>
              <Route path='/edit-course/:courseId' element={<EditCourse/>}/>
              <Route path='/add-subject/:courseId' element={<AddSubject/>}/>
            </Routes>
          </div>
        </div>
      )}

      {userData.role === "a" &&(
        <div className='container-wrap'>
          <NavbarAdmin/>
          
          <div className='content'>
            <Routes>
              <Route path='/' element={<Home/>}/>
              <Route path='/manageUser' element={<ManageUser/>}/>
            </Routes>
          </div>
        </div>
      )}
      
    </div>
  )
}

export default App
