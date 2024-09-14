import { Route, Routes, useLocation } from 'react-router-dom'

import './App.css'
import Navbar from './components/Navbar';

import Home from './pages/home';
import Login from './pages/authenticator/Login';
import Register from './pages/authenticator/Register';
import Reset from './pages/authenticator/Reset';
import ResetCode from './pages/authenticator/ResetCode';
import Setpassword from './pages/authenticator/Setpassword';
import Courses from './pages/courses';

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
        </Routes>
      </div>
    </div>
  )
}

export default App
