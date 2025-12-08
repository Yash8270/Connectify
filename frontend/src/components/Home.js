import React from "react";
import { Player } from "@lottiefiles/react-lottie-player";
import HomeAnimate from "../assets/Home.json";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white px-6 md:px-16 py-12 space-y-24">

      {/* ✅ HERO SECTION */}
      <section className="flex flex-col md:flex-row items-center justify-between gap-12">

        {/* TEXT */}
        <div className="bg-white/5 p-8 rounded-2xl border border-white/10 max-w-xl shadow-2xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-yellow-400">
            Welcome to Connectify
          </h1>

          <p className="text-gray-300 leading-relaxed text-lg mb-6">
            Connectify is your ultimate platform for building meaningful
            connections in a fast-paced digital world. Chat, share, collaborate
            and grow your network — all in one place.
          </p>

          <div className="flex gap-4">
            {/* ✅ GET STARTED → LOGIN */}
            <button
              onClick={() => navigate("/login")}
              className="bg-yellow-400 text-black px-6 py-3 rounded-lg font-bold hover:opacity-90 transition"
            >
              Get Started
            </button>

            {/* ✅ LEARN MORE → ABOUT */}
            <button
              onClick={() => navigate("/about")}
              className="border border-yellow-400 text-yellow-400 px-6 py-3 rounded-lg hover:bg-yellow-400 hover:text-black transition"
            >
              Learn More
            </button>
          </div>
        </div>

        {/* ANIMATION */}
        <div className="flex justify-center items-center w-full md:w-1/2">
          <Player
            autoplay
            loop
            src={HomeAnimate}
            className="w-[260px] sm:w-[320px] md:w-[480px]"
          />
        </div>
      </section>

      {/* ✅ FEATURES SECTION */}
      <section>
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
          Why People Love Connectify
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              title: "Real-time Chat",
              text: "Instant messaging with lightning-fast performance.",
            },
            {
              title: "Group Networking",
              text: "Create groups and grow your professional circle.",
            },
            {
              title: "Secure Platform",
              text: "Your data is encrypted and fully protected.",
            },
            {
              title: "Smart Dashboard",
              text: "Track activities and engagement in one place.",
            },
          ].map((item, i) => (
            <div
              key={i}
              className="bg-[#1a1a1a] p-6 rounded-2xl border border-white/10 shadow-lg 
                         hover:border-yellow-400 hover:scale-[1.03] transition-all duration-300"
            >
              <h3 className="text-lg font-semibold mb-3 text-yellow-400">
                {item.title}
              </h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                {item.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ✅ STATS SECTION */}
      <section className="bg-[#1a1a1a] rounded-2xl border border-white/10 p-10 shadow-xl">
        <div className="grid grid-cols-1 sm:grid-cols-3 text-center gap-10">
          <div>
            <div className="text-4xl font-bold text-yellow-400">10K+</div>
            <div className="text-gray-300 mt-2">Active Users</div>
          </div>

          <div>
            <div className="text-4xl font-bold text-yellow-400">50K+</div>
            <div className="text-gray-300 mt-2">Messages Sent</div>
          </div>

          <div>
            <div className="text-4xl font-bold text-yellow-400">1K+</div>
            <div className="text-gray-300 mt-2">Communities</div>
          </div>
        </div>
      </section>

      {/* ✅ CALL TO ACTION */}
      <section className="text-center max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold mb-6">
          Start Connecting Today
        </h2>
        <p className="text-gray-300 mb-8 text-lg">
          Join thousands of users already building connections, sharing ideas,
          and growing together on Connectify.
        </p>

        {/* ✅ JOIN NOW → LOGIN */}
        <button
          onClick={() => navigate("/login")}
          className="bg-yellow-400 text-black px-10 py-4 rounded-xl font-bold text-lg hover:opacity-90 transition"
        >
          Join Now
        </button>
      </section>

    </div>
  );
};

export default Home;
