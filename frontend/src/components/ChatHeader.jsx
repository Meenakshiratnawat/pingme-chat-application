import { X } from "lucide-react";

const ChatHeader = ({ selectedUser, setSelectedUser, onlineUsers }) => {
  const isOnline = onlineUsers.includes(selectedUser._id);

  return (
    <div className="px-4 py-3 border-b border-base-300 bg-base-100 shadow-sm">
      <div className="flex items-center justify-between">
        {/* User Info */}
        <div className="flex items-center gap-4">
          {/* Avatar with status dot */}
          <div className="relative w-10 h-10">
            <img
              src={selectedUser.profilePic || "/avatar.png"}
              alt={selectedUser.fullName}
              className="rounded-full w-full h-full object-cover border"
            />
            <span
              className={`
                absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white
                ${isOnline ? "bg-green-500" : "bg-gray-400"}
              `}
            />
          </div>

          {/* Name + Status */}
          <div>
            <h3 className="font-semibold leading-tight">{selectedUser.fullName}</h3>
            <p className="text-xs text-zinc-500">
              {isOnline ? "Online" : "Offline"}
            </p>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={() => setSelectedUser(null)}
          className="p-2 rounded-full hover:bg-base-300 transition-all"
          title="Close chat"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;