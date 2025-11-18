import React from "react";
import { Player } from "@lottiefiles/react-lottie-player";
import HomeAnimate from "../assets/Home.json";

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-r from-brandDark to-brandGrey2 text-white flex flex-col md:flex-row items-center justify-between px-6 md:px-16 pt-24 gap-10">

      <div className="backdrop-blur-xl bg-white/5 p-8 rounded-2xl border border-white/10 max-w-xl shadow-lg">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-brandYellow">
          Welcome to Connectify Services
        </h1>
        <p className="text-gray-300 leading-relaxed text-lg">
          Connectify is your ultimate platform for building meaningful
          connections in a fast-paced digital world. Whether you're networking,
          collaborating, or staying connected — Connectify makes it effortless.
        </p>
      </div>

      <div className="flex justify-center items-center w-full md:w-1/2">
        <Player
          autoplay
          loop
          src={HomeAnimate}
          className="w-[300px] md:w-[500px]"
        />
      </div>
    </div>
  );
};

export default Home;
