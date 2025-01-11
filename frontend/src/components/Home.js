import React from 'react';
import '../css_file/Home.css';
import social from '../assets/social.svg';
import { Player } from '@lottiefiles/react-lottie-player';
import HomeAnimate from '../assets/Home.json';

const Home = () => {

  return (
    <>
      <div className="connect">
        <div className="inform">
          <div className="informhead">Welcome to our Connectify Services</div>
          <div className="informcontent">
            Connectify is your ultimate platform for building meaningful
            connections in a fast-paced, digital world. Whether you’re looking
            to grow your network, stay connected with loved ones, or collaborate
            on exciting projects, Connectify is designed to bring people
            together. Our intuitive interface and powerful tools make it easy to
            share ideas, communicate effectively, and foster relationships that
            matter. Join a vibrant community where every connection opens the
            door to endless possibilities. Let’s connect, collaborate, and
            create together!
          </div>
        </div>
        <div className="social">
          {/* <img id="socialimage" src={social} alt="Description of my image" /> */}
          <Player id="socialimage"
        autoplay
        loop
        src={HomeAnimate}
        
      />
        </div>
      </div>
    </>
  );
}

export default Home;
