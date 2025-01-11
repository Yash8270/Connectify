import React from 'react';
import { useState, useContext } from 'react';
import {useNavigate} from 'react-router-dom';
import '../css_file/Login.css';
import Connect_Context from '../context/Connectcontext';
import Pic from './Pic';

const Login = () => {

    const navigate = useNavigate();

    const signtext = "Hey there! Don't have an account yet? Click here to sign up!";
    const logintext ="Welcome back! Already have an account? Click here to log in!";

    const [position, setposition] = useState('right');
    const [text,settext] = useState(signtext);
      const [show, setShow] = useState(false);

    const toggleAnimation = () => {
        setposition((prev) => (prev === "right" ? "left" : "right")); 
        settext((prev) => (prev === signtext ? logintext : signtext)); 
      }

    const context = useContext(Connect_Context);
    const {signin,login_fxn,authdata} = context;  

    const [signdata, setsigndata] = useState({username:'', email:'',password:'', confpassword:'',profilepic:''});
    const [logindata, setlogindata] = useState({username:'',password:''});
    const [auth, setauth] = useState('');
    const [userid, setuserid] = useState('');

    const handlesignin = (e) => {
        e.preventDefault();
        console.log(signdata);
        if(signdata.password !== signdata.confpassword || signdata.password === '') {
            alert("Please enter password and it's confirm password same");
        }
        else if (signdata.username === '' || signdata.email === '') {
            alert("Please enter username and password");
        }

        else {
            setShow(true);
            // signin(signdata.username, signdata.email, signdata.password,signdata.profilepic);

        }
    }

    const handlelogin = async (e) => {
        e.preventDefault();
        const authdatas = await login_fxn(logindata.username, logindata.password);
        // console.log("The Message: ", authdata);
        // console.log(authdatas.userid);
        if(authdatas) {
            setauth(authdatas.authtoken);
            // console.log(auth);
            setuserid(authdatas.userid);
            // console.log(userid);
            navigate(`/showcase/${authdatas.userid}`);
            // navigate('/');
        }
        
    }

    return (
        <>
        <div className='form-body'>
        <div className='form-container'>
            <div className='login'>
                <form id='log'>
                    <label id='username'>Username: </label>
                    <input type='text' id='userinput' placeholder='Enter your username' onChange={(e) => setlogindata({...logindata, username: e.target.value})}></input>
                    <label id='pass'>Password: </label>
                    <input type='password' id='password' placeholder='Enter your password' onChange={(e) => setlogindata({...logindata, password: e.target.value})}></input>
                    <button id='logbtn' onClick={handlelogin}>Login</button>
                </form>
            </div>
            <div className='signin'>
                <form id='sign'>
                    <label id='newuser'>Enter a unique Username:</label>
                    <input type='text' id='newinput' placeholder='Enter new username' onChange={(e) => setsigndata({ ...signdata, username: e.target.value })}></input>
                    <label id='email'>Email-ID: </label>
                    <input type='email' id='eid' placeholder='Enter your email' onChange={(e) => setsigndata({ ...signdata, email: e.target.value })}></input>
                    <label id='newpass'>Enter a secure password: </label>
                    <input type='password' id='newpassword' placeholder='Enter your password' onChange={(e) => setsigndata({ ...signdata, password: e.target.value })}></input>
                    <label id='confpass'>Re-Enter your password: </label>
                    <input type='password' id='confpassword' placeholder='Re-Enter password' onChange={(e) => setsigndata({ ...signdata, confpassword: e.target.value })}></input>
                    <button id='signbtn' onClick={handlesignin}>Sign-In</button>
                </form>
            </div>
            <div className={`panel ${position}`}>
                <div className='paneltxt'>{text}</div>
                <div className='panelbtn'> <button id='panelbtn' onClick={toggleAnimation}>
        {position === "right" ? "Sign-in" : "Login"}
      </button></div>
            </div>
        </div>
        <Pic show={show} setShow={setShow} signdata= {signdata}/>
       </div> 
        </>
    );
}

export default Login;