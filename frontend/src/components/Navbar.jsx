import { Link, useNavigate } from "react-router-dom";
import { LogOut, MessageSquare, Settings, User, Bell } from "lucide-react";
import toast from "react-hot-toast";
import { logoutApi } from "../apiServices/AuthApi";
import { usePendingRequestsStore } from "../store/useRequestStore";
import { useEffect, useState } from "react";
import { axiosInstance } from "../lib/axios";
import { getSocket } from "../lib/socket";

const Navbar = ({ authUser, setAuthUser, hasNewRequest }) => {
  const navigate = useNavigate();
  // const [hasNewRequest, setHasNewRequest] = useState(false);


  console.log(hasNewRequest, "hasNewRequest")
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

  return (
    <header className="bg-base-100 border-b border-base-300 fixed w-full top-0 z-40 backdrop-blur-md shadow-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Left - App Branding */}
        <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-all">
          <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-primary" />
          </div>
          <span className="text-lg font-bold">Chatty</span>
        </Link>

        {/* Right - Actions */}
        <div className="flex items-center gap-4">

          <Link to="/requests" className="text-zinc-500 hover:text-primary transition-colors">
            <div className="relative">
              <Bell className="w-5 h-5" />
              {hasNewRequest && (
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full" />
              )}
            </div>
          </Link>
          <Link to="/settings" className="text-zinc-500 hover:text-primary transition-colors">
            <Settings className="w-5 h-5" />
          </Link>

          {authUser && (
            <div className="dropdown dropdown-end">
              <div tabIndex={0} role="button" className="avatar">
                <div className="w-8 rounded-full ring ring-base-300 ring-offset-base-100 ring-offset-2 cursor-pointer">
                  <img
                    src={authUser.profilePic || "/avatar.png"}
                    alt="profile"
                  />
                </div>
              </div>
              <ul
                tabIndex={0}
                className="mt-3 p-2 shadow menu menu-sm dropdown-content bg-base-100 border border-base-300 rounded-lg w-40 z-50"
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