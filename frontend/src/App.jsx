import { Route, Routes, useLocation } from 'react-router-dom'

import './App.css'
import Navbar from './components/Navbar';
import Home from './components/user_contents/Home';
import Login from './components/Login';
import Register from './components/Register';
import Reset from './components/Reset';
import ResetCode from './components/ResetCode';
import Setpassword from './components/Setpassword';

import Courses from './components/user_contents/Courses';

function App() {
  const location = useLocation();

  const noNavbarRoutes = ['/login', '/changepassword', '/register', '/reset', '/resetcode', '/newpassword'];
  const showNavbar = !noNavbarRoutes.includes(location.pathname);

  return (
    <div className='container'>
      {showNavbar && <nav><Navbar /></nav>}
      
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
