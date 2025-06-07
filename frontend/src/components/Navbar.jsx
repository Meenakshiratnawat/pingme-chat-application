import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { LogOut, MessageCircle, Settings, User, Bell } from "lucide-react";
import toast from "react-hot-toast";
import { logoutApi } from "../apiServices/AuthApi";
import { axiosInstance } from "../lib/axios";

const Navbar = ({ authUser, setAuthUser, hasNewRequest }) => {
  const navigate = useNavigate();
  const [pendingRequests, setPendingRequests] = useState([]);

  const handleLogout = async () => {
    try {
      await logoutApi();
      setAuthUser(null);
      toast.success("Logged out");
      navigate("/login");
    } catch (err) {
      toast.error(err.message);
    }
  };
  
  useEffect(() => {
    if (authUser?._id) {
      fetchPending();
    }
  }, [authUser?._id]);

  const fetchPending = async () => {
    try {
      const res = await axiosInstance.get("/connections/pending");
      setPendingRequests(res.data);
    } catch (err) {
      toast.error("Failed to load pending requests");
    }
  };

  return (
    <header className="bg-base-100 shadow-md border-b border-base-200 sticky top-0 z-40 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 hover:opacity-90 transition-all">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center shadow-sm animate-pulse-slow">
            <MessageCircle className="w-5 h-5 text-primary" />
          </div>
          <span className="text-xl font-bold tracking-wide text-primary">PingMe</span>
        </Link>

        <div className="flex items-center gap-4">
          <Link to="/requests" className="relative text-zinc-500 hover:text-primary transition-colors">
            <Bell className="w-5 h-5" />
            {(hasNewRequest || pendingRequests.length > 0) && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-base-100 animate-ping" />
            )}
          </Link>
          <Link to="/settings" className="text-zinc-500 hover:text-primary transition-colors">
            <Settings className="w-5 h-5" />
          </Link>

          {authUser && (
            <div className="dropdown dropdown-end">
              <div tabIndex={0} role="button" className="avatar hover:scale-105 transition-transform">
                <div className="w-9 rounded-full ring-2 ring-primary/50 ring-offset-2 cursor-pointer">
                  <img
                    src={authUser.profilePic || "/avatar.png"}
                    alt="profile"
                  />
                </div>
              </div>
              <ul
                tabIndex={0}
                className="mt-3 p-2 shadow-lg menu menu-sm dropdown-content bg-base-100 border border-base-200 rounded-xl w-44 z-50"
              >
                <li>

                  <Link to="/profile" className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Profile
                  </Link>
                </li>
                <li>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-red-500"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;