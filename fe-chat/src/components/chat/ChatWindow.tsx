import { useEffect, useState, useCallback, Suspense, lazy } from "react";
import { IoIosSettings } from "react-icons/io";
import style from "@/styles/chatWindow.module.css";

const ChatList = lazy(() => import("./ChatList"));
const MessageWindow = lazy(() => import("./MessageWindow"));

// Fallback senza testo
const ChatListFallback = () => (
  <div className={style["chat-list-fallback"]}></div>
);

const MessageWindowFallback = () => (
  <div className={style["message-window-fallback"]}></div>
);

export default function ChatWindow() {
  const [currentChat, setCurrentChat] = useState("");
  const [currentChatname, setCurrentChatName] = useState("");
  const [currentUserId, setUserId] = useState("");
  const [chatParticipants, setChatParticipants] = useState<string[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const userId = sessionStorage.getItem('currentUser');
    if (userId) {
      setUserId(userId);
      setIsInitialized(true);
    } else {
      const timer = setTimeout(() => {
        const retryUserId = sessionStorage.getItem('currentUser');
        setUserId(retryUserId || "");
        setIsInitialized(true);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleChatSelection = useCallback((chatId: string, chatName: string, participantIds: string[]) => {
    setCurrentChat(chatId);
    setCurrentChatName(chatName);
    setChatParticipants(participantIds);
  }, []);

  if (!isInitialized) {
    return <div className={style["window-container"]}></div>;
  }

  return (
    <div className={style["window-container"]}>
      <div className={style["settings-container"]}>
        <div className={style["setting"]}>
          <button title="Settings" className={style["btnSetting"]}><IoIosSettings /></button>
          <button title="Settings" className={style["btnSetting"]}><IoIosSettings /></button>
        </div>
      </div>

      <Suspense fallback={<ChatListFallback />}>
        <ChatList onButtonClick={handleChatSelection} />
      </Suspense>

      <Suspense fallback={<MessageWindowFallback />}>
        <MessageWindow
          chatId={currentChat}
          chatName={currentChatname}
          currentUserId={currentUserId}
          chatParticipants={chatParticipants}
        />
      </Suspense>
    </div>
  );
}