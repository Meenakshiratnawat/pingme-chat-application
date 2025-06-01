import { MessageSquareHeart, Smile } from "lucide-react";

const NoChatSelected = () => {
  return (
    <div className="w-full flex flex-1 flex-col items-center justify-center p-16 bg-base-100/50">
      <div className="max-w-md text-center space-y-6">
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center animate-float shadow-md">
            <MessageSquareHeart className="w-10 h-10 text-primary" />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-primary">No Chat Selected</h2>

        <p className="text-base-content/70">
          Ready to catch up? 🗨️ <br />
          Pick someone from the sidebar and start chatting!
        </p>

        <div className="text-sm text-zinc-400 italic">
          <Smile className="inline-block w-4 h-4 mr-1" />
          "Every convo starts with a hello 👋"
        </div>
      </div>
    </div>
  );
};

export default NoChatSelected;