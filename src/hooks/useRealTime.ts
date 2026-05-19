import { useEffect } from "react";
import { pusherClient } from "../lib/pusher";

export const useRealTimeGlobal = (onNewMessage: (msg: any) => void) => {
  useEffect(() => {
    // CHANGE: Subscribe to the global channel
    const channel = pusherClient.subscribe("global-office");

    channel.bind("new-message", (data: any) => {
      onNewMessage(data);
    });

    return () => {
      pusherClient.unsubscribe("global-office");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};