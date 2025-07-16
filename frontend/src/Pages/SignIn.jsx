import React, { useContext, useState } from 'react'
import bg from '../assets/authBg.png'
import { IoEye } from "react-icons/io5";
import { IoEyeOff } from "react-icons/io5";
import { useNavigate } from 'react-router-dom';
import { userDataContext } from '../context/UserContext';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';

const SignIn = () => {
    const { serverUrl,currentUser, setCurrentUser } = useContext(userDataContext);
    const [showPassword, setShowPassword] = useState(true);
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [err, setErr] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSignIn = async (e) => {
        e.preventDefault();
        setErr("");
        setLoading(true);
        if (email.length === 0 || password.length === 0) {
            setErr("Email and Password are required");
            setLoading(false);
            return;
        }
       

        try {
            let result = await axios.post(`${serverUrl}/api/auth/login`, {
              
                email,
                password
            }, { withCredentials: true })
            setLoading(false);
            setEmail('');
            setPassword('');
            setCurrentUser(result.data);
            toast.success("SignIn successful");
            navigate('/');
            
        } catch (error) {
            console.log(error);
            setErr(error.response.data.message);
            setLoading(false);
            setCurrentUser(null);

        }
    }
    return (
        <div className='w-full h-[100vh] bg-cover flex justify-center items-center' style={{ backgroundImage: `url(${bg})` }}>
            <form className='px-[20px] w-[90%] h-[600px] max-w-[500px] bg-[#00000062] backdrop-blur shadow-lg shadow-black flex flex-col items-center justify-center gap-[20px] ' onSubmit={handleSignIn}>
                <h1 className='text-white text-[30px] font-semibold mb-[30px]'>Register to <span className='text-blue-700'>Virtual Assistant</span></h1>
                <input type="email" placeholder='Enter your email' className='w-full h-[60px] bg-transparent border-b-2 border-blue-400 outline-none text-white placeholder:text-white px-[20px] py-[10px] rounded-b' value={email} onChange={(e) => { setEmail(e.target.value) }} />
                <div className='w-full h-[60px] bg-transparent border-b-2 border-blue-400 text-white rounded-b relative'>
                    <input type={!showPassword ? "text" : 'password'} placeholder='Enter your password' className='w-full h-full bg-transparent outline-none text-white placeholder:text-white px-[20px] py-[10px] ' value={password} onChange={(e) => { setPassword(e.target.value) }} />
                    {showPassword ? <IoEye className='absolute top-[20px] right-[20px] w-[25px] h-[25px] text-white cursor-pointer' onClick={() => { setShowPassword((prev) => !prev) }} /> : <IoEyeOff className='absolute top-[20px] right-[20px] w-[25px] h-[25px] text-white cursor-pointer' onClick={() => { setShowPassword((prev) => !prev) }} />}
                </div>
                {err.length > 0 && <p className='text-red-500 text-[18px] font-semibold'>*{err}</p>}
                <button className='mt-[30px] min-w-[150px] h-[60px] text-black font-semibold bg-white rounded-full text-[19px]' disabled={loading}>{loading?"Loading...":"Sign In"}</button>
                <p className='text-white text-[18px] cursor-pointer' onClick={() => { navigate('/signup') }}>New User? <span className='text-blue-400 '>Sign up here</span></p>


            </form>
        </div>
    )
}

export default SignIn