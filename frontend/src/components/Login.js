import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import Connect_Context from "../context/Connectcontext";
import Pic from "./Pic";
import { Eye, EyeOff } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();

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

  // password visibility toggles
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
    <div className="min-h-screen flex justify-center items-center bg-gradient-to-r from-brandDark to-brandGrey2 text-white px-4 pt-20">

      <div className="relative w-full max-w-4xl bg-brandGrey rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row transition-all duration-700">

        {/* LOGIN FORM */}
        <div className="flex-1 p-8">
          <form className="flex flex-col gap-4">

            <label className="font-semibold">Username</label>
            <input
              type="text"
              className="p-3 rounded bg-brandGrey2 border border-gray-600"
              onChange={(e) =>
                setlogindata({ ...logindata, username: e.target.value })
              }
            />

            {/* PASSWORD with eye */}
            <label className="font-semibold">Password</label>
            <div className="relative">
              <input
                type={showLoginPass ? "text" : "password"}
                className="p-3 rounded w-full bg-brandGrey2 border border-gray-600"
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
              className="bg-brandYellow text-black p-3 rounded font-bold hover:opacity-90"
              onClick={handlelogin}
            >
              Login
            </button>
          </form>
        </div>

        {/* SIGN-IN FORM */}
        <div className="flex-1 p-8">
          <form className="flex flex-col gap-4">

            <label className="font-semibold">New Username</label>
            <input
              type="text"
              className="p-3 rounded bg-brandGrey2 border border-gray-600"
              onChange={(e) =>
                setsigndata({ ...signdata, username: e.target.value })
              }
            />

            <label className="font-semibold">Email-ID</label>
            <input
              type="email"
              className="p-3 rounded bg-brandGrey2 border border-gray-600"
              onChange={(e) =>
                setsigndata({ ...signdata, email: e.target.value })
              }
            />

            {/* SIGNUP PASSWORD + eye */}
            <label className="font-semibold">Password</label>
            <div className="relative">
              <input
                type={showSignPass ? "text" : "password"}
                className="p-3 rounded w-full bg-brandGrey2 border border-gray-600"
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

            {/* SIGNUP CONFIRM PASSWORD + eye */}
            <label className="font-semibold">Confirm Password</label>
            <div className="relative">
              <input
                type={showSignConfPass ? "text" : "password"}
                className="p-3 rounded w-full bg-brandGrey2 border border-gray-600"
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
              className="bg-brandYellow text-black p-3 rounded font-bold hover:opacity-90"
              onClick={handlesignin}
            >
              Sign-In
            </button>
          </form>
        </div>

        {/* YELLOW SLIDING PANEL (now softer yellow) */}
        <div
          className={`absolute top-0 h-full w-1/2 bg-brandYellow text-black flex flex-col items-center justify-center text-center px-6 transition-position duration-700 ${
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
