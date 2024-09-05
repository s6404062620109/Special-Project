import { Route, Routes, useLocation } from 'react-router-dom'

import './App.css'
import Navbar from './components/Navbar';
import Home from './components/user_contents/Home';
import Login from './components/Login';
import Register from './components/Register';

function App() {
  const location = useLocation();

  const noNavbarRoutes = ['/login', '/changepassword', '/register'];
  const showNavbar = !noNavbarRoutes.includes(location.pathname);

  return (
    <div className='container'>
      {showNavbar && <nav><Navbar /></nav>}
      
      <div className='content'>
        <Routes>
          <Route path='/' element={<Home/>}/>
          <Route path='/login' element={<Login/>}/>
          <Route path='/register' element={<Register/>}/>
        </Routes>
      </div>
    </div>
  )
}

export default App
