import React from 'react';
import '../css_file/About.css';
import interaction from '../assets/interaction.svg';
import cross from '../assets/cross.svg';
import connection from '../assets/connection.svg';
import network from '../assets/network.svg';

const About = () => {
    return (
      <>
        <div className="about-container">
          <div className="about-connectify">
            <div className="abouthead">About Connectify</div>
            <div className="aboutconnect">
              Welcome to Connectify, a platform designed to simplify the way you
              connect, collaborate, and communicate. In today’s fast-paced
              world, building and maintaining meaningful relationships can be
              challenging. Connectify aims to bridge that gap by providing a
              seamless, user-friendly environment where people can come
              together, share ideas, and stay connected effortlessly.
            </div>
          </div>
          <div className="why">
            <div className="whyhead">Why Choose Connectify?</div>
            <div className="whyconnect">
              <ul>
                <li>
                  <strong>Intuitive Design:</strong> Connectify offers a sleek
                  and easy-to-navigate interface that makes it simple for users
                  of all tech backgrounds to get started.
                </li>
                <li>
                  <strong>Seamless Networking:</strong> Whether you're looking
                  to connect with friends, family, or professionals, Connectify
                  provides the tools you need to stay engaged and grow your
                  network.
                </li>
                <li>
                  <strong>Collaboration Made Easy:</strong> Collaborate on
                  projects, share updates, and work together with our robust
                  communication features.
                </li>
                <li>
                  <strong>Privacy First:</strong> Your data is safe with us. We
                  prioritize your privacy and security, ensuring that your
                  connections are meaningful and your information stays
                  protected.
                </li>
              </ul>
            </div>
          </div>
          <div className="mission">
            <div className="missionhead">Our Mission</div>
            <div className="missionconnect">
              At Connectify, our mission is to empower individuals and
              communities by fostering connections that matter. We believe in
              the power of relationships and are committed to helping you
              nurture them in a way that’s both effective and enjoyable.
            </div>
          </div>
          <div className="features">Key Features</div>
          <div className="communicate">
            <div className="comhead">Real-time Communication</div>
            <div className="comconnect">
              Stay in touch with instant messaging and notifications.
              <div className="comimage">
                <img
                  id="com"
                  src={connection}
                  alt="Real time communication"
                ></img>
              </div>
            </div>
          </div>
          <div className="network">
            <div className="nethead">Group Networking</div>
            <div className="netconnect">
              Create or join groups to connect with like-minded individuals
              <div className="netimage">
                <img id="net" src={network} alt="Real time communication"></img>
              </div>
            </div>
          </div>
          <div className="dashboard">
            <div className="dashhead">Interactive Dashboard</div>
            <div className="dashconnect">
              Track your activities and connections at a glance.
              <div className="dashimage">
                <img
                  id="dash"
                  src={interaction}
                  alt="Interactive Dashboard"
                ></img>
              </div>
            </div>
          </div>
          <div className="cross">
            <div className="crosshead">Cross-platform Compatibility</div>
            <div className="crossconnect">
              Stay in touch with instant messaging and notifications.
              <div className="crossimage">
                <img
                  id="cr"
                  src={cross}
                  alt="Cross-platform Compatibility"
                ></img>
              </div>
            </div>
          </div>
        </div>
        <footer>
          <div class="footer-branding">
            <h3>Connectify</h3>
            <p>Empowering Connections, Anytime, Anywhere.</p>
          </div>
        </footer>
      </>
    );
}

export default About;