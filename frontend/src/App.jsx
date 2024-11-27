import { Route, Routes, useLocation } from 'react-router-dom'

import './App.css'
import Navbar from './components/Navbar';

import Home from './pages/home';
import Courses from './pages/courses';

import Login from './pages/authenticate/login';
import Register from './pages/authenticate/register';
import Reset from './pages/authenticate/reset';
import ResetCode from './pages/authenticate/resetotp';
import Setpassword from './pages/authenticate/newpassword';
import CourseDetail from './pages/coursedetails';
import Subject from './pages/subject';
import Pretest from './pages/test/pre';

function App() {
  const location = useLocation();

  const noNavbarRoutes = ['/login', '/changepassword', '/register', '/reset', '/resetcode', '/newpassword'];
  const showNavbar = !noNavbarRoutes.includes(location.pathname);

  return (
    <div className='container'>
      {showNavbar && <Navbar />}
      
      <div className='content'>
        <Routes>
          <Route path='/' element={<Home/>}/>
          <Route path='/login' element={<Login/>}/>
          <Route path='/register' element={<Register/>}/>
          <Route path='/reset' element={<Reset/>}/>
          <Route path='/resetcode' element={<ResetCode/>}/>
          <Route path='/newpassword' element={<Setpassword/>}/>
          
          <Route path='/courses' element={<Courses/>}/>
          <Route path='/course/:courseId' element={<CourseDetail/>}/>
          <Route path='/course/:courseId/subject/:subjectId' element={<Subject/>}/>
          <Route path='/course/:courseId/pretest/:historyId' element={<Pretest/>}/>
        </Routes>
      </div>
    </div>
  )
}

export default App
