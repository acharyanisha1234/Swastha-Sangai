import { useEffect, useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import LandingPage from './pages/LandingPage';
import './app.css';
import EmailVerify from './pages/EmailVerify';
import ResetPassword from './pages/ResetPassword';
import { ToastContainer } from 'react-toastify';
import HomePage from './pages/HomePage';
import FitnessProfile from './pages/FitnessProfile';
import Dashboard from './pages/Dashboard';
import DashboardMain from './pages/DashboardMain';
import DonateMain from './pages/DonateMain';
import FriendsMain from './pages/FriendsMain';
import CommentSection from './components/CommentSection';
import ChatBox from './components/ChatBox';
import MainLayout from './components/MainLayout';
import { SocketContext } from './context/SocketContext';
import { AuthContext } from './context/AuthContext';

const App = () => {
  const socket = useContext(SocketContext);
  const { userData } = useContext(AuthContext);

  useEffect(() => {
    if (socket && userData?.id) {
      socket.emit("register", userData.id);
    }
  }, [socket, userData]);

  return (
    <>
      <ToastContainer />
      
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={
          <MainLayout>
            <LandingPage />
          </MainLayout>
        } />
        <Route path="/email-verify" element={
          <MainLayout>
            <EmailVerify />
          </MainLayout>
        } />
        <Route path="/reset-password" element={
          <MainLayout>
            <ResetPassword />
          </MainLayout>
        } />

        <Route path="/dashboard" element={<Navigate to="/home/dashboard" />} />

        <Route path="/home" element={
          <MainLayout>
            <HomePage />
          </MainLayout>
        }>
          <Route path="fitness-profile" element={<FitnessProfile />} />
          <Route path="dashboard" element={<Dashboard />}>
            <Route index element={<DashboardMain />} />
            <Route path="main" element={<DashboardMain />} />
            <Route path="friends" element={<FriendsMain />} />
            <Route path="donate" element={<DonateMain />} />
            <Route path="comments" element={<CommentSection />} />
            <Route path="chat" element={<ChatBox />} />
          </Route>
        </Route>
      </Routes>
    </>
  );
};

export default App;