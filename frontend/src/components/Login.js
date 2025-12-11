import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import Connect_Context from "../context/Connectcontext";
import Pic from "./Pic";
import { Eye, EyeOff } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();

  // position "right" = Panel is on right (Covering Sign Up) -> Login Visible
  // position "left" = Panel is on left (Covering Login) -> Sign Up Visible
  const [position, setPosition] = useState("right");
  const [show, setShow] = useState(false);

  const signtext = "Hey there! Don't have an account yet? Click here to sign up!";
  const logintext = "Welcome back! Already have an account? Click here to log in!";
  const [text, setText] = useState(signtext);

  const togglePanel = () => {
    setPosition(position === "right" ? "left" : "right");
    setText(text === signtext ? logintext : signtext);
  };

  const { login_fxn } = useContext(Connect_Context);

  const [signdata, setsigndata] = useState({
    username: "",
    email: "",
    password: "",
    confpassword: "",
    profilepic: "",
  });

  const [logindata, setlogindata] = useState({
    username: "",
    password: "",
  });

  const [showLoginPass, setShowLoginPass] = useState(false);
  const [showSignPass, setShowSignPass] = useState(false);
  const [showSignConfPass, setShowSignConfPass] = useState(false);

  const handlesignin = (e) => {
    e.preventDefault();
    if (signdata.password !== signdata.confpassword || !signdata.password)
      return alert("Passwords must match");
    setShow(true);
  };

  const handlelogin = async (e) => {
    e.preventDefault();
    const res = await login_fxn(logindata.username, logindata.password);
    if (res) navigate(`/showcase/${res.userid}`);
  };

  return (
    <div className="h-[calc(100vh-5rem)] overflow-hidden flex justify-center items-center bg-[#0f0f0f] text-white px-4">
      {/* Changed flex-col for mobile, flex-row for desktop */}
      <div className="relative w-full max-w-4xl bg-[#1a1a1a] rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row transition-all duration-700 border border-white/10">
        
        {/* LOGIN FORM */}
        {/* Logic: If position is LEFT (panel covers login), hide this on mobile. Always block on desktop. */}
        <div className={`flex-1 p-8 ${position === "left" ? "hidden md:block" : "block"}`}>
          <form className="flex flex-col gap-4">
            <h2 className="text-2xl font-bold mb-2 md:hidden">Login</h2>
            
            <label className="font-semibold">Username</label>
            <input
              type="text"
              className="p-3 rounded bg-[#111] border border-white/10"
              onChange={(e) =>
                setlogindata({ ...logindata, username: e.target.value })
              }
            />

            <label className="font-semibold">Password</label>
            <div className="relative">
              <input
                type={showLoginPass ? "text" : "password"}
                className="p-3 rounded w-full bg-[#111] border border-white/10"
                onChange={(e) =>
                  setlogindata({ ...logindata, password: e.target.value })
                }
              />
              <button
                type="button"
                onClick={() => setShowLoginPass(!showLoginPass)}
                className="absolute right-3 top-3 text-gray-300"
              >
                {showLoginPass ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <button
              className="bg-yellow-400 text-black p-3 rounded font-bold hover:opacity-90 mt-2"
              onClick={handlelogin}
            >
              Login
            </button>

            {/* MOBILE ONLY: Switch to Sign Up */}
            <div className="mt-4 text-center md:hidden">
              <p className="text-sm text-gray-400">Don't have an account?</p>
              <button 
                type="button"
                onClick={togglePanel} 
                className="text-yellow-400 font-bold hover:underline"
              >
                Sign up
              </button>
            </div>

          </form>
        </div>

        {/* SIGN-UP FORM */}
        {/* Logic: If position is RIGHT (panel covers signup), hide this on mobile. Always block on desktop. */}
        <div className={`flex-1 p-8 ${position === "right" ? "hidden md:block" : "block"}`}>
          <form className="flex flex-col gap-4">
            <h2 className="text-2xl font-bold mb-2 md:hidden">Sign Up</h2>

            <label className="font-semibold">New Username</label>
            <input
              type="text"
              className="p-3 rounded bg-[#111] border border-white/10"
              onChange={(e) =>
                setsigndata({ ...signdata, username: e.target.value })
              }
            />

            <label className="font-semibold">Email-ID</label>
            <input
              type="email"
              className="p-3 rounded bg-[#111] border border-white/10"
              onChange={(e) =>
                setsigndata({ ...signdata, email: e.target.value })
              }
            />

            <label className="font-semibold">Password</label>
            <div className="relative">
              <input
                type={showSignPass ? "text" : "password"}
                className="p-3 rounded w-full bg-[#111] border border-white/10"
                onChange={(e) =>
                  setsigndata({ ...signdata, password: e.target.value })
                }
              />
              <button
                type="button"
                onClick={() => setShowSignPass(!showSignPass)}
                className="absolute right-3 top-3 text-gray-300"
              >
                {showSignPass ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <label className="font-semibold">Confirm Password</label>
            <div className="relative">
              <input
                type={showSignConfPass ? "text" : "password"}
                className="p-3 rounded w-full bg-[#111] border border-white/10"
                onChange={(e) =>
                  setsigndata({ ...signdata, confpassword: e.target.value })
                }
              />
              <button
                type="button"
                onClick={() => setShowSignConfPass(!showSignConfPass)}
                className="absolute right-3 top-3 text-gray-300"
              >
                {showSignConfPass ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <button
              className="bg-yellow-400 text-black p-3 rounded font-bold hover:opacity-90 mt-2"
              onClick={handlesignin}
            >
              Sign-In
            </button>

            {/* MOBILE ONLY: Switch to Login */}
            <div className="mt-4 text-center md:hidden">
              <p className="text-sm text-gray-400">Already have an account?</p>
              <button 
                type="button"
                onClick={togglePanel} 
                className="text-yellow-400 font-bold hover:underline"
              >
                Login
              </button>
            </div>

          </form>
        </div>

        {/* SLIDING PANEL (HIDDEN ON MOBILE, VISIBLE ON DESKTOP) */}
        <div
          className={`hidden md:flex absolute top-0 h-full w-1/2 bg-yellow-400 text-black flex-col items-center justify-center text-center px-6 transition-all duration-700 ${
            position === "right"
              ? "right-0 rounded-l-2xl"
              : "left-0 rounded-r-2xl"
          }`}
        >
          <p className="text-lg font-semibold mb-4">{text}</p>
          <button
            onClick={togglePanel}
            className="bg-black text-white px-6 py-2 rounded-full mt-4"
          >
            {position === "right" ? "Sign In" : "Login"}
          </button>
        </div>
      </div>

      <Pic show={show} setShow={setShow} signdata={signdata} />
    </div>
  );
};

export default Login;