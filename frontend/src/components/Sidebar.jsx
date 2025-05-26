import { useEffect, useState } from "react";
import { Users, Search } from "lucide-react";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

const Sidebar = ({ selectedUser, setSelectedUser, onlineUsers, authUser }) => {
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState([]);
  const [isUsersLoading, setIsUsersLoading] = useState(true);

  // Fetch all users
  const getUsers = async () => {
    setIsUsersLoading(true);
    try {
      const res = await axiosInstance.get("/messages/users");
      setUsers(res.data);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load users");
    } finally {
      setIsUsersLoading(false);
    }
  };

  useEffect(() => {
    getUsers();
  }, []);

  const filteredUsers = users.filter((user) => {
    const matchesSearch = user.fullName.toLowerCase().includes(searchTerm.toLowerCase());
    const isOnline = onlineUsers.includes(user._id);
    return matchesSearch && (!showOnlineOnly || isOnline);
  });

  if (isUsersLoading) return <SidebarSkeleton />;

  return (
    <aside className="h-full w-20 lg:w-72 border-r border-base-300 flex flex-col">
      {/* Header + Filter */}
      <div className="border-b border-base-300 p-4 space-y-4">
        <div className="flex items-center gap-2">
          <Users className="size-5" />
          <span className="font-medium hidden lg:block">Contacts</span>
        </div>

        <div className="hidden lg:flex items-center gap-2">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search..."
            className="input input-sm input-bordered w-full text-sm"
          />
        </div>

        <div className="hidden lg:flex items-center gap-2 text-sm text-zinc-500">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showOnlineOnly}
              onChange={(e) => setShowOnlineOnly(e.target.checked)}
              className="checkbox checkbox-sm"
            />
            Show online only
          </label>
          <span>({onlineUsers.length - 1} online)</span>
        </div>
      </div>

      {/* Users List */}
      <div className="overflow-y-auto w-full py-2 px-2">
        {filteredUsers.map((user) => {
          const isSelected = selectedUser?._id === user._id;
          const isOnline = onlineUsers.includes(user._id);

          return (
            <div
              key={user._id}
              onClick={() => setSelectedUser(user)}
              className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all
                ${isSelected ? "bg-base-300 ring-2 ring-base-200" : "hover:bg-base-200"}`}
            >
              {/* Avatar with status ring */}
              <div className="relative">
                <img
                  src={user.profilePic || "/avatar.png"}
                  alt={user.name}
                  className="w-10 h-10 rounded-full object-cover border"
                />
                {isOnline && (
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                )}
              </div>

              {/* User info */}
              <div className="hidden lg:block min-w-0">
                <p className="font-medium truncate text-sm">{user.fullName}</p>
                <p className="text-xs text-zinc-500">{isOnline ? "Online" : "Offline"}</p>
              </div>
            </div>
          );
        })}

        {filteredUsers.length === 0 && (
          <div className="text-center text-zinc-500 py-4 text-sm">No users found</div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;