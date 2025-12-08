import React from "react";

const About = () => {
  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white px-4 md:px-16 py-16 pt-24">
      
      {/* HERO SECTION */}
      <div className="max-w-5xl mx-auto text-center mb-16">
        <h1 className="text-3xl md:text-5xl font-bold mb-6 text-yellow-400">
          About Connectify
        </h1>
        <p className="text-gray-300 text-base md:text-lg leading-relaxed">
          Welcome to <span className="text-white font-semibold">Connectify</span>, a
          platform designed to simplify the way you connect, collaborate, and
          communicate. Build relationships, share ideas, and stay connected
          effortlessly in one powerful ecosystem.
        </p>
      </div>

      {/* WHY CHOOSE */}
      <div className="max-w-6xl mx-auto mb-20">
        <h2 className="text-2xl md:text-3xl font-semibold mb-10 text-center">
          Why Choose Connectify?
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {[
            {
              title: "Intuitive Design",
              text: "A sleek and easy-to-use interface suitable for everyone.",
            },
            {
              title: "Seamless Networking",
              text: "Connect with friends, family, and professionals instantly.",
            },
            {
              title: "Easy Collaboration",
              text: "Share updates and work together without friction.",
            },
            {
              title: "Privacy First",
              text: "Your data stays encrypted, protected, and private.",
            },
          ].map((item, i) => (
            <div
              key={i}
              className="bg-[#1a1a1a] p-6 rounded-2xl shadow-lg border border-white/10 
                         transition-all duration-300 hover:scale-105 hover:border-yellow-400"
            >
              <h3 className="text-lg font-semibold mb-3 text-yellow-400">
                {item.title}
              </h3>
              <p className="text-gray-300 text-sm">{item.text}</p>
            </div>
          ))}

        </div>
      </div>

      {/* MISSION */}
      <div className="max-w-4xl mx-auto mb-20 text-center">
        <h2 className="text-2xl md:text-3xl font-semibold mb-6">
          Our Mission
        </h2>
        <p className="text-gray-300 text-base md:text-lg leading-relaxed">
          At Connectify, our mission is to empower individuals and communities by
          fostering connections that truly matter. We believe in meaningful
          relationships and strive to make them easier, stronger, and more
          rewarding.
        </p>
      </div>

      {/* FEATURES */}
      <div className="max-w-6xl mx-auto mb-20">
        <h2 className="text-2xl md:text-3xl font-semibold mb-10 text-center">
          Key Features
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

          {[
            {
              title: "Real-time Communication",
              text: "Instant messaging, live updates, and notifications.",
            },
            {
              title: "Group Networking",
              text: "Create or join groups and grow your network.",
            },
            {
              title: "Interactive Dashboard",
              text: "Track your activities and connections in one place.",
            },
            {
              title: "Cross-platform Support",
              text: "Use Connectify anywhere on any device.",
            },
          ].map((item, i) => (
            <div
              key={i}
              className="group bg-gradient-to-br from-[#1c1c1c] to-[#161616] 
                         p-6 rounded-2xl shadow-lg border border-white/10 
                         transition-all duration-300 hover:scale-105 hover:shadow-yellow-400/30"
            >
              <h3 className="text-lg font-semibold mb-3 text-yellow-400 group-hover:text-yellow-300">
                {item.title}
              </h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                {item.text}
              </p>
            </div>
          ))}

        </div>
      </div>

      {/* FOOTER */}
      <footer className="border-t border-white/10 pt-10 text-center">
        <h3 className="text-xl font-semibold text-yellow-400 mb-2">
          Connectify
        </h3>
        <p className="text-gray-400 text-sm">
          Empowering Connections, Anytime, Anywhere.
        </p>
      </footer>

    </div>
  );
};

export default About;
