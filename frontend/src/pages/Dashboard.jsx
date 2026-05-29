import React, { useEffect } from 'react'
import SideBar from '../components/SideBar'
import { Outlet } from 'react-router-dom'
import ChatBox from '../components/ChatBox'

const Dashboard = () => {
    useEffect(() => {
        document.documentElement.classList.add("dark");
    }, []);

    return (
        <div className='flex w-screen h-screen'>
            <div id="left" className='w-2/10'>
                <SideBar />
            </div>

            <div id="right" className='w-8/10 h-screen'>
                <Outlet />
                 {/* Add ChatBox at the end */}
                     <ChatBox />
            </div>
        </div>
    )
}

export default Dashboard;