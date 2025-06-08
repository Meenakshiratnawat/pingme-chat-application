import { useRef, useState } from "react";
import { Image, Send, X, Smile } from "lucide-react";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { getSocket } from "../lib/socket";
import EmojiPicker from "emoji-picker-react";

const MessageInput = ({ authUser, selectedUser, setMessages }) => {
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file?.type?.startsWith("image/")) {
      toast.error("Please select a valid image file.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleTyping = () => {
    const socket = getSocket();
    if (!socket || !authUser || !selectedUser) return;

    socket.emit("typing", {
      senderId: authUser._id,
      receiverId: selectedUser._id,
    });

    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stopTyping", {
        senderId: authUser._id,
        receiverId: selectedUser._id,
      });
    }, 1000);
  };

  const handleEmojiClick = (emojiData, event) => {
    setText((prev) => prev + emojiData.emoji);
    setShowEmojiPicker(false); // Auto-close picker when emoji is selected
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() && !imagePreview) return;

    try {
      const res = await axiosInstance.post(
        `/messages/send/${selectedUser._id}`,
        { text: text.trim(), image: imagePreview },
        { withCredentials: true }
      );

      if (res.data) {
        setMessages((prev) => [...prev, res.data]);
        setText("");
        setImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send message");
    }
  };

  return (
    <div className="w-full p-4 bg-base-100 shadow-inner rounded-b-xl relative">
      {/* Image Preview */}
      {imagePreview && (
        <div className="mb-3 flex items-center gap-2">
          <div className="relative group">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-24 h-24 object-cover rounded-lg border border-zinc-300 shadow"
            />
            <button
              onClick={removeImage}
              className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-white text-zinc-700 hover:bg-zinc-200 border border-zinc-300 flex items-center justify-center"
              type="button"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* Message Input */}
      <form
        onSubmit={handleSendMessage}
        className="flex items-center gap-2 bg-base-200 rounded-full px-4 py-2 shadow-sm focus-within:ring-2 focus-within:ring-primary/40 transition"
      >
        {/* Emoji Icon */}
        <button
          type="button"
          onClick={() => setShowEmojiPicker((prev) => !prev)}
          className="text-zinc-500 hover:text-primary relative"
        >
          <Smile size={20} />
        </button>

        {/* Input Field */}
        <input
          type="text"
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-zinc-400"
          placeholder="Type your message..."
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            handleTyping();
          }}
        />

        {/* Image Upload Button */}
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          className="hidden"
          onChange={handleImageChange}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className={`text-zinc-500 hover:text-emerald-500 ${imagePreview ? "text-emerald-500" : ""}`}
        >
          <Image size={20} />
        </button>

        {/* Send Button */}
        <button
          type="submit"
          disabled={!text.trim() && !imagePreview}
          className={`p-1.5 rounded-full bg-primary text-white hover:bg-primary/90 transition ${
            !text.trim() && !imagePreview ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          <Send size={18} />
        </button>
      </form>

      {/* Emoji Picker */}
      {showEmojiPicker && (
        <div className="absolute bottom-16 left-4 z-50">
          <EmojiPicker onEmojiClick={handleEmojiClick} />
        </div>
      )}
    </div>
  );
};

export default MessageInput;