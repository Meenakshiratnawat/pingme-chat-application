import { X } from "lucide-react";

const ChatHeader = ({ selectedUser, setSelectedUser, onlineUsers }) => {
  const isOnline = onlineUsers.includes(selectedUser._id);

  return (
    <div className="px-4 py-3 border-b border-base-300 bg-base-100 shadow-sm sticky top-0 z-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="relative w-11 h-11">
            <img
              src={selectedUser.profilePic || "/avatar.png"}
              alt={selectedUser.fullName}
              className="rounded-full w-full h-full object-cover border border-base-300 shadow-sm"
            />
            <span
              className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white ${
                isOnline ? "bg-green-500 animate-pulse" : "bg-gray-400"
              }`}
            />
          </div>

          <div className="min-w-0">
            <h3 className="font-bold text-base-content truncate">{selectedUser.fullName}</h3>
            <span
              className={`text-xs font-medium inline-flex items-center gap-1 px-2 py-0.5 rounded-full ${
                isOnline
                  ? "bg-green-100 text-green-700"
                  : "bg-zinc-100 text-zinc-500"
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-current" />
              {isOnline ? "Online" : "Offline"}
            </span>
          </div>
        </div>

        <button
          onClick={() => setSelectedUser(null)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-base-300 transition-all text-sm text-zinc-600"
          title="Close chat"
        >
          <X className="w-4 h-4" />
          <span className="hidden sm:inline">Close</span>
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;