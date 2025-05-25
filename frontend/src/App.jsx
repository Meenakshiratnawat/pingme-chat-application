import { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import ProfilePage from "./pages/ProfilePage";
import SettingsPage from "./pages/SettingsPage";
import Navbar from "./components/Navbar";
import { axiosInstance } from "./lib/axios";
import { Toaster } from "react-hot-toast";
import { connectSocket } from "./lib/socket";

const App = () => {
  const [authUser, setAuthUser] = useState(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  const [onlineUsers, setOnlineUsers] = useState([]);
 const [theme, setTheme] = useState(() => localStorage.getItem("chat-theme") || "coffee");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  useEffect(() => {
    if (authUser?._id) {
      connectSocket(authUser._id, setOnlineUsers);
    }
  }, [authUser]);

  useEffect(() => {
    axiosInstance
      .get("/auth/check")
      .then((res) => setAuthUser(res.data))
      .catch(() => setAuthUser(null))
      .finally(() => setIsCheckingAuth(false));
  }, []);

  if (isCheckingAuth) {
    return <div className="h-screen flex justify-center items-center">Checking session...</div>;
  }

  return (
    <>
      <Navbar authUser={authUser} setAuthUser={setAuthUser} />
      <Routes>
        <Route path="/" element={authUser ? (
          <HomePage authUser={authUser} onlineUsers={onlineUsers} setOnlineUsers={setOnlineUsers} />
        ) : <Navigate to="/login" />} />

        <Route path="/login" element={!authUser ? <LoginPage setAuthUser={setAuthUser} /> : <Navigate to="/" />} />
        <Route path="/signup" element={!authUser ? <SignUpPage setAuthUser={setAuthUser} /> : <Navigate to="/" />} />
        <Route path="/profile" element={authUser ? <ProfilePage /> : <Navigate to="/login" />} />
        <Route path="/settings" element={authUser ? <SettingsPage /> : <Navigate to="/login" />} />
      </Routes>
      <Toaster />
    </>
  );
};

export default App;