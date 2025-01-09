import React from 'react';
import {Link} from 'react-router-dom';
import '../css_file/Navbar.css';

const Navbar = () => {
    return (
        <nav>
        <div className="nav-container">
          <div className="name">Connectify</div>

          <div className="center-nav">
            <div className="home">
               <Link to='/' style={{ textDecoration: 'none', color: 'inherit' }}>Home</Link> 
                </div>
            <div className="about">
               <Link to='/about' style={{ textDecoration: 'none', color: 'inherit' }}>About</Link> 
                </div>
            <div className="contact">
               <Link to='/contact' style={{ textDecoration: 'none', color: 'inherit' }}>Contact</Link> 
                </div>
          </div>

          <div className="login-sign">
            <Link to='/login' style={{ textDecoration: 'none', color: 'inherit' }}>Login/SignIn</Link>
            </div>
        </div>
      </nav>
    );
}

export default Navbar;