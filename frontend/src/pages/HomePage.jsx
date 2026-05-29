import React from 'react'
import { Outlet } from 'react-router-dom'
import ChatBox from '../components/ChatBox'

const HomePage = () => {
  return (
    <div className='bg-background w-screen h-screen'>
        <Outlet />
       <ChatBox />
    </div>
  )
}

export default HomePage