// components/useContactRequestListener.js
import { useEffect } from "react";
import { getSocket } from "../lib/socket";

const useContactRequestNotification = (authUser, onRequestReceived) => {
  useEffect(() => {
    const socket = getSocket();
    if (!authUser?._id || !socket) return;

    const handleRequest = (data) => {
      console.log("📩 contact-request-received →", data);
      onRequestReceived?.(); // fire the callback
    };

    socket.on("contact-request-received", handleRequest);

    return () => socket.off("contact-request-received", handleRequest);
  }, [authUser?._id]);
};

export default useContactRequestNotification;