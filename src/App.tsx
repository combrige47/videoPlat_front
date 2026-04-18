import {useEffect, useState} from 'react'
import './App.css'
import AuthModal from './components/AuthModal'
import type { UserInfo } from './types/user'
import request from "./utils/request.ts";
import VideoList from "./components/VideoList.tsx";
import {Routes, Route, Link, BrowserRouter} from "react-router-dom";
import VideoPlayer from "./pages/VideoPlayer";
import UploadPage from "./pages/uploadPage.tsx";
import UserSpace from "./pages/UserSpace.tsx";
import {PlayCircle} from "lucide-react";
import ProfilePage from "./pages/ProfilePage.tsx";
import {UserContext} from "./context/UserContext.ts";

function App() {
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
          <Link to="/" className="logo-container">
              <div className="logo-icon-wrapper">
                  <PlayCircle className="logo-icon" size={28} />
              </div>
              <span className="logo-text">
        ECHO<span className="logo-dot">.</span>VIDEO
      </span>
          </Link>


        <div className="user-info">
            <Link to="/upload" className="upload-link">
                <div className="upload-box">
                    <div className="upload-btn">上传视频</div>
                </div>
            </Link>
          {user ? (
              <div className="user-box">
                  <Link to={`/space/${user.id}`} className="space-link">
                      <div className="avatar">
                          <img
                              src={user.avatar || "https://via.placeholder.com/36"}
                          />
                      </div>

                  </Link>
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
        <main className="app-main">
        <Routes>
            <Route path="/" element={<VideoList />} />
            <Route path="/upload" element={<UploadPage />}/>
            <Route path= "/space/:userId" element={<UserSpace />} />
            <Route path= "/account" element={<ProfilePage />} />
            <Route path="/:publicId" element={<VideoPlayer />} />
        </Routes>
        </ main>
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />
    </>
  )
}

export default App