import React, { useState, useContext } from 'react';
import { Routes, Route, BrowserRouter as Router, useLocation } from 'react-router-dom';
import Home from './components/Home';
import About from './components/About';
import Login from './components/Login';
import Showcase from './components/Showcase';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Shownav from './components/Shownav';
import Profile from './components/Profile';
import Chat from './components/Chat';
import Connect_Context from './context/Connectcontext';
import Post from './components/Post';
import Userprofile from './components/Userprofile';
import Update from './components/Update';

const AppRoutes = () => {

  const location = useLocation();
  const context = useContext(Connect_Context);
  const { authdata } = context;

    return (
      <>
      {(location.pathname === '/about' || location.pathname === '/' || location.pathname === '/login') ? <Navbar /> : <Shownav />}
        <Routes>
            <Route exact path="/" element={<Home />} />
            <Route exact path="/about" element={<About />} />
            <Route exact path="/login" element={<Login />} />
            <Route exact path="/showcase/:userid" element={ <Showcase />} />
            <Route exact path="/profile/:userid" element={ <Profile/>} />
            <Route exact path="/chat/:userid" element={ <Chat/>} />
            <Route exact path="/userprofile/:userid" element={<Userprofile/> } />
            <Route exact path="/update" element={<Update/> } />
        </Routes>
      </>  
    );
};


const App = () => {

  return (
    <Router>
        <AppRoutes />
    </Router>
  );

  // const [isModalOpen, setModalOpen] = useState(false);

  // const openModal = () => setModalOpen(true);
  // const closeModal = () => setModalOpen(false);

  // return (
  //   <div>
  //     <button onClick={openModal}>Open Modal</button>
      
  //     <Post isOpen={isModalOpen} onClose={closeModal}>
  //       <h2>This is a Modal</h2>
  //       <p>Here's some content inside the modal.</p>
  //       <button onClick={closeModal}>Close Modal</button>
  //     </Post>
  //   </div>
  // );

}



export default App;
