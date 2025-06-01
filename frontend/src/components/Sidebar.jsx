import { useEffect, useState } from "react";
import { Users, Plus } from "lucide-react";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { getSocket } from "../lib/socket";

const Sidebar = ({ selectedUser, setSelectedUser, onlineUsers, contacts, authUser }) => {
  const [allUsers, setAllUsers] = useState([]);
  const [isUsersLoading, setIsUsersLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getUsers = async () => {
    setIsUsersLoading(true);
    try {
      const res = await axiosInstance.get("/messages/users");
      setAllUsers(res.data);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load users");
    } finally {
      setIsUsersLoading(false);
    }
  };

  useEffect(() => {
    getUsers();
  }, []);

  const handleAddUser = async (user) => {
    const socket = getSocket();
    if (!contacts.find((u) => u._id === user._id)) {
      try {
        await axiosInstance.post("/connections/send", {
          senderId: authUser._id,
          receiverId: user._id,
        });

        socket.emit("contact-request", {
          senderId: authUser._id,
          receiverId: user._id,
          senderName: authUser.fullName,
        });

        toast.success(`Contact request sent to ${user.fullName}`);
      } catch (err) {
        toast.error(err?.response?.data?.message || "Failed to send request");
      }
    }
  };

  if (isUsersLoading) return <SidebarSkeleton />;

  return (
    <aside className="h-full w-20 lg:w-72 border-r border-base-300 flex flex-col">
      {/* Header */}
      <div className="border-b border-base-300 p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="size-5" />
          <span className="font-medium hidden lg:block">Contacts</span>
        </div>
        <button
          className="flex items-center gap-1 text-sm text-primary border border-primary px-2 py-1 rounded hover:bg-primary hover:text-white transition-all hidden lg:flex"
          onClick={() => setIsModalOpen(true)}
        >
          <Plus className="w-4 h-4" />
          Add
        </button>
      </div>

      {/* Contacts List */}
      <div className="overflow-y-auto w-full py-2 px-2">
        {contacts.map((user) => {
          const isSelected = selectedUser?._id === user._id;
          const isOnline = onlineUsers.includes(user._id);

          return (
            <div
              key={user._id}
              onClick={() => setSelectedUser(user)}
              className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all
                ${isSelected ? "bg-base-300 ring-2 ring-base-200" : "hover:bg-base-200"}`}
            >
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

              <div className="hidden lg:block min-w-0">
                <p className="font-medium truncate text-sm">{user.fullName}</p>
                <p className="text-xs text-zinc-500">{isOnline ? "Online" : "Offline"}</p>
              </div>
            </div>
          );
        })}

        {contacts.length === 0 && (
          <div className="text-center text-zinc-500 py-4 text-sm">No contacts added</div>
        )}
      </div>

      {/* Add User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-base-100 rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">Add Users</h2>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {allUsers.map((user) => {
                const isOnline = onlineUsers.includes(user._id);
                const alreadyAdded = contacts.some((u) => u._id === user._id);

                return (
                  <div
                    key={user._id}
                    className="flex items-center justify-between border-b py-2"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={user.profilePic || "/avatar.png"}
                        alt={user.name}
                        className="w-8 h-8 rounded-full border"
                      />
                      <div>
                        <p className="text-sm font-medium">{user.fullName}</p>
                        <p className="text-xs text-zinc-500">{isOnline ? "Online" : "Offline"}</p>
                      </div>
                    </div>
                    <button
                      className="btn btn-xs"
                      onClick={() => handleAddUser(user)}
                      disabled={alreadyAdded}
                    >
                      {alreadyAdded ? "Added" : "+ Add"}
                    </button>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 text-right">
              <button className="btn btn-sm btn-outline" onClick={() => setIsModalOpen(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;