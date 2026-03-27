import {useEffect, useState} from 'react'
import './App.css'
import AuthModal from './components/AuthModal'
import type { UserInfo } from './types/user'
import request from "./utils/request.ts";
import VideoList from "./components/VideoList";
import { Routes, Route } from "react-router-dom";
import VideoPlayer from "./pages/VideoPlayer";

function App() {
  const [count, setCount] = useState(0)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [user, setUser] = useState<UserInfo | null>(null)

  const handleAuthSuccess = (userData: UserInfo) => {
    setUser(userData)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    setUser(null)
  }

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) return;

    request({
      url: "/api/user/me",
      method: "GET"
    })
        .then(res => setUser(res.data))
        .catch(() => {
          localStorage.removeItem("token");
        });
  }, []);
  return (
    <>
      <header className="app-header">
        <div className="logo">🎬 MyVideo</div>

        <div className="user-info">
          {user ? (
              <div className="user-box">
                <img
                    src={user.avatar || "https://via.placeholder.com/40"}
                    className="avatar"
                />
                <span>{user.username}</span>
                <button onClick={handleLogout}>登出</button>
              </div>
          ) : (
              <button className="login-btn" onClick={() => setIsAuthModalOpen(true)}>
                登录 / 注册
              </button>
          )}
        </div>
      </header>
        <Routes>
            <Route path="/" element={<VideoList />} />
            <Route path="/:publicId" element={<VideoPlayer />} />
        </Routes>
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />
    </>
  )
}

export default App