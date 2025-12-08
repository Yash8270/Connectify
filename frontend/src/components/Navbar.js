import React, { useState } from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* FIXED NAVBAR */}
      <nav className="fixed top-0 left-0 w-full h-20 bg-[#0f0f0f] text-white z-50 border-b border-white/10">
        <div className="flex items-center justify-between px-6 md:px-12 h-full">

          {/* BRAND */}
          <div className="text-2xl font-bold text-yellow-400">
            <Link to="/">Connectify</Link>
          </div>

          {/* DESKTOP NAV */}
          <div className="hidden md:flex items-center gap-10 text-base font-medium">
            <Link to="/" className="text-gray-300 hover:text-yellow-400 transition">
              Home
            </Link>

            <Link to="/about" className="text-gray-300 hover:text-yellow-400 transition">
              About
            </Link>

            <Link
              to="/login"
              className="border border-yellow-400 text-yellow-400 px-5 py-2 rounded-full 
                         hover:bg-yellow-400 hover:text-black transition"
            >
              Login / SignUp
            </Link>
          </div>

          {/* HAMBURGER */}
          <button
            className="md:hidden text-3xl text-yellow-400"
            onClick={() => setOpen(true)}
          >
            ☰
          </button>
        </div>
      </nav>

      {/* ✅ GLOBAL SPACER — THIS IS THE ONLY PLACE PADDING IS HANDLED */}
      <div className="h-20"></div>

      {/* MOBILE SIDE MENU */}
      <div
        className={`fixed top-0 right-0 h-full w-64 bg-[#0f0f0f] text-white transform ${
          open ? "translate-x-0" : "translate-x-full"
        } transition-transform duration-300 z-50 p-6 md:hidden border-l border-white/10`}
      >
        <button
          className="text-4xl absolute top-4 right-4 text-yellow-400"
          onClick={() => setOpen(false)}
        >
          &times;
        </button>

        <div className="mt-20 flex flex-col gap-8 text-xl">
          <Link to="/" onClick={() => setOpen(false)} className="text-gray-300 hover:text-yellow-400">
            Home
          </Link>

          <Link to="/about" onClick={() => setOpen(false)} className="text-gray-300 hover:text-yellow-400">
            About
          </Link>

          <Link
            to="/login"
            onClick={() => setOpen(false)}
            className="mt-4 border border-yellow-400 px-4 py-2 rounded-full text-center 
                       text-yellow-400 hover:bg-yellow-400 hover:text-black transition"
          >
            Login / SignUp
          </Link>
        </div>
      </div>

      {/* OVERLAY */}
      {open && (
        <div
          className="fixed inset-0 bg-black/60 md:hidden z-40"
          onClick={() => setOpen(false)}
        />
      )}
    </>
  );
};

export default Navbar;
