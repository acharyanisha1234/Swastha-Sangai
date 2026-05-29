import React from 'react'
import { FaUserFriends } from 'react-icons/fa'
import { MdDashboard } from 'react-icons/md'
import { BiSolidDonateHeart } from 'react-icons/bi'
import { IoIosSettings } from 'react-icons/io'
import { CgProfile } from 'react-icons/cg'
import { useLocation, useNavigate } from 'react-router-dom'

const SideBar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const pathname = location.pathname;

    return (
        <div className='flex flex-col justify-between w-80 h-screen bg-foreground/20 px-10 py-5'>
            <div id="top" className='flex flex-col gap-20 w-full h-full'>
                 <h2 className="font-semibold text-2xl tracking-wide text-foreground cursor-pointer">
                <span className="font-space-grotesk">
                    <span className="font-extralight">Swastha</span>
                    <span className="text-primary font-semibold">Sangai</span>
                </span>
            </h2>
            <div id="menuSection" className='flex flex-col gap-5'>
                <span className='text-muted-foreground uppercase'>Menu</span>
                <div id="menuButtons" className='flex flex-col gap-3'>
                    <span className={`flex gap-3 items-center border-l-2 border-transparent transition-all duration-500 hover:border-primary cursor-pointer p-2 ${pathname === '/home/dashboard/main' ? 'border-primary!' : ''}`} onClick={()=>{navigate('/home/dashboard/main')}}>
                        <MdDashboard className={`${pathname === '/home/dashboard/main' ? 'text-primary' : ''}`}/>
                        <span>Dashboard</span>
                    </span>
                    <span className={`flex gap-3 items-center border-l-2 border-transparent transition-all duration-500 hover:border-primary cursor-pointer p-2 ${pathname === '/home/dashboard/friends' ? 'border-primary!' : ''}`}  onClick={()=>{navigate('/home/dashboard/friends')}}>
                        <FaUserFriends className={`${pathname === '/home/dashboard/friends' ? 'text-primary' : ''}`}/>
                        <span>Friends</span>
                    </span>
                    <span className={`flex gap-3 items-center border-l-2 border-transparent transition-all duration-500 hover:border-primary cursor-pointer p-2 ${pathname === '/home/dashboard/donate' ? 'border-primary!' : ''}`} onClick={()=>{navigate('/home/dashboard/donate')}}>
                        <BiSolidDonateHeart className={`${pathname === '/home/dashboard/donate' ? 'text-primary' : ''}`}/>
                        <span>Donate</span>
                    </span>
                </div>
            </div>

            <div id="menuSection" className='flex flex-col gap-5'>
                <span className='text-muted-foreground uppercase'>General</span>
                <div id="menuButtons" className='flex flex-col gap-3'>
                    <span className={`flex gap-3 items-center border-l-2 border-transparent transition-all duration-500 hover:border-primary cursor-pointer p-2`} onClick={()=>{navigate('/home/dashboard/settings')}}>
                        <IoIosSettings className={`${pathname === '/home/dashboard/settings' ? 'text-primary' : ''}`}/>
                        <span>Settings</span>
                    </span>
                    <span className={`flex gap-3 items-center border-l-2 border-transparent transition-all duration-500 hover:border-primary cursor-pointer p-2`} onClick={()=>{navigate('/home/fitness-profile')}}>
                        <CgProfile className={`${pathname === '/home/dashboard/profile' ? 'text-primary' : ''}`}/>
                        <span>Profile</span>
                    </span>
                </div>
            </div>

            </div>
           
            <div id="bottomSection" className='w-full h-40 bg-stone-500 rounded-xl'></div>


        </div>
    )
}

export default SideBar