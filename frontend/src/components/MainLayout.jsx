import React from 'react';
import { useLocation } from 'react-router-dom';
import ChatBox from './ChatBox';

const MainLayout = ({ children }) => {
  const location = useLocation();
  
  // Hide chat only on login and signup pages
  const hideChat = location.pathname === '/login' || 
                   location.pathname === '/signup' || 
                   location.pathname === '/register';
  
  return (
    <div style={{ minHeight: '100vh' }}>
      {children}
      {!hideChat && <ChatBox />}
    </div>
  );
};

export default MainLayout;