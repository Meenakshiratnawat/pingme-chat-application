import { useEffect, useState } from "react";
import { Users, Plus, X } from "lucide-react";
import Fuse from "fuse.js";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { getSocket } from "../lib/socket";

const Sidebar = ({ selectedUser, setSelectedUser, onlineUsers, contacts, authUser }) => {
  const [allUsers, setAllUsers] = useState([]);
  const [isUsersLoading, setIsUsersLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchAllUsers = async () => {
    try {
      setIsUsersLoading(true);
      const res = await axiosInstance.get("/messages/users");
      setAllUsers(res.data);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load users");
    } finally {
      setIsUsersLoading(false);
    }
  };

  const handleAddUser = async (user) => {
    try {
      await axiosInstance.post("/connections/send", {
        senderId: authUser._id,
        receiverId: user._id,
      });

      const socket = getSocket();
      socket.emit("contact-request", {
        senderId: authUser._id,
        receiverId: user._id,
        senderName: authUser.fullName,
      });

      toast.success(`Contact request sent to ${user.fullName}`);
      setIsModalOpen(false)
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to send request");
    }
  };

  useEffect(() => {
    fetchAllUsers();
  }, []);

  if (isUsersLoading) return <SidebarSkeleton />;

  const fuse = new Fuse(contacts, {
    keys: ["fullName"],
    threshold: 0.3,
  });

  const results = searchTerm ? fuse.search(searchTerm).map((r) => r.item) : contacts;

  const highlightMatch = (text) => {
    if (!searchTerm) return text;
    const index = text.toLowerCase().indexOf(searchTerm.toLowerCase());
    if (index === -1) return text;
    return (
      <>
        {text.substring(0, index)}
        <span className="bg-yellow-200 rounded">{text.substring(index, index + searchTerm.length)}</span>
        {text.substring(index + searchTerm.length)}
      </>
    );
  };

  return (
    <aside className="h-full w-20 lg:w-72 border-r border-base-300 flex flex-col bg-gradient-to-b from-white via-neutral-50 to-white">
      <div className="border-b border-base-300 p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl animate-bounce">💬</span>
          <span className="font-bold hidden lg:block text-base-content">Chat Buddies</span>
        </div>
        <button
          className="hidden lg:flex items-center gap-2 text-sm text-primary border border-primary px-3 py-1.5 rounded-full hover:bg-primary hover:text-white transition-all"
          onClick={() => setIsModalOpen(true)}
        >
          <Plus className="w-4 h-4" />
          Add
        </button>
      </div>

      <div className="px-3 pt-3">
        <div className="relative">
          <input
            type="text"
            placeholder="Search buddies..."
            className="input input-sm input-bordered w-full pr-8 rounded-lg"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
              onClick={() => setSearchTerm("")}
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="overflow-y-auto w-full py-2 px-2 space-y-1">
        {results.length > 0 ? (
          results.map((user) => {
            const isSelected = selectedUser?._id === user._id;
            const isOnline = onlineUsers.includes(user._id);

            return (
              <div
                key={user._id}
                onClick={() => setSelectedUser(user)}
                className={`flex items-center gap-3 p-2 rounded-xl cursor-pointer transition-all duration-300
                  ${isSelected ? "bg-primary/10 ring-2 ring-primary" : "hover:bg-base-200/70"}`}
              >
                <div className="relative">
                  <img
                    src={user.profilePic || "/avatar.png"}
                    alt={user.fullName}
                    className="w-10 h-10 rounded-full object-cover border border-base-300"
                  />
                  {isOnline && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-white rounded-full " />
                  )}
                </div>
                <div className="hidden lg:block min-w-0">
                  <p className="font-semibold truncate text-sm">{highlightMatch(user.fullName)}</p>
                  <p className="text-xs text-zinc-500">{isOnline ? "Online 🟢" : "Offline ⚪"}</p>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center text-zinc-400 py-6 text-sm italic">No matches found 😢</div>
        )}
      </div>

      <div className="lg:hidden p-3 border-t border-base-300 bg-white/70 backdrop-blur-md shadow-inner mt-auto">
        <button
          className="w-full flex items-center justify-center gap-2 bg-primary text-white font-medium text-sm py-2 px-4 rounded-full shadow hover:bg-primary/90 transition-all"
          onClick={() => setIsModalOpen(true)}
        >
            Add +
        </button>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-base-100 rounded-xl shadow-2xl p-6 w-full max-w-md border border-base-300">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">🧑‍🤝‍🧑 Add New Buddies</h2>
            <div className="space-y-3 max-h-60 overflow-y-auto scrollbar-thin pr-1">
              {allUsers.map((user) => {
                const isOnline = onlineUsers.includes(user._id);
                const alreadyAdded = contacts.some((u) => u._id === user._id);

                return (
                  <div key={user._id} className="flex items-center justify-between border-b py-2">
                    <div className="flex items-center gap-3">
                      <img
                        src={user.profilePic || "/avatar.png"}
                        alt={user.fullName}
                        className="w-8 h-8 rounded-full border border-base-300"
                      />
                      <div>
                        <p className="text-sm font-medium">{user.fullName}</p>
                        <p className="text-xs text-zinc-500">{isOnline ? "Online" : "Offline"}</p>
                      </div>
                    </div>
                    <button
                      className={`btn btn-xs ${alreadyAdded ? "btn-disabled" : "btn-accent"}`}
                      onClick={() => handleAddUser(user)}
                      disabled={alreadyAdded}
                    >
                      {alreadyAdded ? "Added" : "➕ Add"}
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