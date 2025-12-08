import React, { useState } from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <nav className="fixed top-0 left-0 w-full bg-gradient-to-r from-brandDark to-brandGrey2 text-white shadow-lg z-50">
        <div className="flex items-center justify-between px-6 py-4">
          {/* Brand */}
          <div className="text-2xl font-bold text-brandYellow">
            <Link to="/">Connectify</Link>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8 text-lg">
            <Link to="/" className="hover:text-brandYellow">Home</Link>
            <Link to="/about" className="hover:text-brandYellow">About</Link>
            {/* <Link to="/contact" className="hover:text-brandYellow">Contact</Link> */}

            <Link
              to="/login"
              className="border border-white px-4 py-2 rounded-full hover:border-brandYellow hover:text-brandYellow"
            >
              Login/SignIn
            </Link>
          </div>

          {/* Hamburger */}
          <button
            className="md:hidden text-3xl"
            onClick={() => setOpen(true)}
          >
            ☰
          </button>
        </div>
      </nav>

      {/* Mobile Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-64 bg-brandGrey text-white transform ${
          open ? "translate-x-0" : "translate-x-full"
        } transition-all duration-300 z-50 p-6 md:hidden`}
      >
        <button
          className="text-4xl absolute top-4 right-4"
          onClick={() => setOpen(false)}
        >
          &times;
        </button>

        <div className="mt-16 flex flex-col gap-6 text-xl">
          <Link to="/" onClick={() => setOpen(false)}>Home</Link>
          <Link to="/about" onClick={() => setOpen(false)}>About</Link>
          {/* <Link to="/contact" onClick={() => setOpen(false)}>Contact</Link> */}

          <Link
            to="/login"
            className="mt-4 border border-brandYellow px-4 py-2 rounded-full text-center text-brandYellow"
            onClick={() => setOpen(false)}
          >
            Login/SignIn
          </Link>
        </div>
      </div>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}
    </>
  );
};

export default Navbar;
