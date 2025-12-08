import React from "react";

const About = () => {
  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white px-4 md:px-16 py-16">

      <div className="max-w-5xl mx-auto text-center mb-16">
        <h1 className="text-3xl md:text-5xl font-bold mb-6 text-yellow-400">
          About Connectify
        </h1>
        <p className="text-gray-300 text-base md:text-lg leading-relaxed">
          Welcome to <span className="text-white font-semibold">Connectify</span>, a
          platform designed to simplify the way you connect, collaborate, and
          communicate.
        </p>
      </div>

      <div className="max-w-6xl mx-auto mb-20">
        <h2 className="text-2xl md:text-3xl font-semibold mb-10 text-center">
          Why Choose Connectify?
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { title: "Intuitive Design", text: "Easy and smooth interface." },
            { title: "Seamless Networking", text: "Connect instantly." },
            { title: "Easy Collaboration", text: "Collaborate without friction." },
            { title: "Privacy First", text: "Your data stays protected." },
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

      <div className="max-w-4xl mx-auto mb-20 text-center">
        <h2 className="text-2xl md:text-3xl font-semibold mb-6">
          Our Mission
        </h2>
        <p className="text-gray-300 text-base md:text-lg leading-relaxed">
          Empowering individuals and communities through meaningful connections.
        </p>
      </div>

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
