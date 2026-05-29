import React, { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';
import axios from 'axios';
import { Button } from './ui/button';
import { MdDarkMode, MdOutlineDarkMode } from "react-icons/md";

const Navbar = () => {
    const navigate = useNavigate();
    const [darkMode,setDarkMode] = useState(true);
    const { isLoggedIn, backendUrl, setIsLoggedIn, userData } = useContext(AuthContext);

    useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

    const logoutHandler = async () => {
        try {
            const res = await axios.post(backendUrl + '/api/auth/logout');
            toast.success(res.data?.message);
            setIsLoggedIn(false);
        } catch (error) {
            console.log(error.response?.data?.message);
            toast.error(error.response?.data?.message);
        }
    }

    const sendVerifyOtp = async () => {
        try {
            const res = await axios.post(backendUrl + '/api/auth/send-verify-otp', {}, { withCredentials: true });
            navigate('/email-verify');
            toast.success(res.data?.message);
        } catch (error) {
            console.log(error.response?.data?.message);
            toast.error(error.response?.data?.message);
        }
    }
    return (
        <div className="w-screen z-50 fixed px-6 py-4 bg-background flex items-center justify-between">
            {/* Left Logo */}
            <h2 className="font-semibold text-2xl tracking-wide text-foreground cursor-pointer">
                <span className="font-space-grotesk">
                    <span className="font-extralight">Swastha</span>
                    <span className="text-primary font-semibold">Sangai</span>
                </span>
            </h2>

            {/* Center Links */}
            <div className="md:flex gap-10 tracking-wider hidden">
                <span className="cursor-pointer hover:text-primary transition">Home</span>
                <span className="cursor-pointer hover:text-primary transition">About</span>
                <span className="cursor-pointer hover:text-primary transition">Contact</span>
            </div>

            {/* Right Buttons */}
            <div className="flex items-center gap-3">
                <Button
                    className={'cursor-pointer'}
                    onClick={() => { isLoggedIn ? logoutHandler() : navigate('/login') }}
                >
                    {isLoggedIn ? "Logout" : "Login"}
                </Button>

                {isLoggedIn && !userData?.isAccountVerified && (
                    <button
                        className="px-5 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition"
                        onClick={sendVerifyOtp}
                    >
                        Verify
                    </button>
                )}
                <Button onClick={()=>{setDarkMode(!darkMode)}} variant={'outline'} className={'cursor-pointer'}>
                    {darkMode ? <MdDarkMode /> : <MdOutlineDarkMode /> }
                    
                </Button>
            </div>
        </div>
    )
}

export default Navbar