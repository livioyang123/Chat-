import { useEffect, useState, useCallback, Suspense, lazy } from "react";
import { IoIosSettings } from "react-icons/io";
import style from "@/styles/chatWindow.module.css";
import { ImSpinner3 } from "react-icons/im";

// Lazy loading dei componenti pesanti
const ChatList = lazy(() => import("./ChatList"));
const MessageWindow = lazy(() => import("./MessageWindow"));

// Componente di loading ottimizzato
const ChatSkeleton = () => (
  <div className={style["window-container"]}>
    <div className={style["settings-container"]}>
      <div className={style["setting"]}>
        <button title="Settings" className={style["btnSetting"]}><IoIosSettings /></button>
        <button title="Settings" className={style["btnSetting"]}><IoIosSettings /></button>
      </div>
    </div>
    <div className={style["chat-skeleton-layout"]}>
      <div className={style["chat-skeleton-sidebar"]}>
        <div className={style["skeleton-item"]}></div>
        <div className={style["skeleton-item"]}></div>
        <div className={style["skeleton-item"]}></div>
      </div>
      <div className={style["chat-skeleton-main"]}>
        <div className={style["skeleton-header"]}></div>
        <div className={style["skeleton-content"]}></div>
      </div>
    </div>
  </div>
);

// Componenti di fallback per Suspense
const ChatListFallback = () => (
  <div className={style["chat-list-fallback"]}>
    Caricamento chat... <ImSpinner3 className="spinner"/>
  </div>
);

const MessageWindowFallback = () => (
  <div className={style["message-window-fallback"]}>
    Caricamento messaggi... <ImSpinner3 className="spinner"/>
  </div>
);

export default function ChatWindow() {
  const [currentChat, setCurrentChat] = useState("");
  const [currentChatname, setCurrentChatName] = useState("");
  const [currentUserId, setUserId] = useState("");
  const [chatParticipants, setChatParticipants] = useState<string[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeUser = () => {
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
    };

    initializeUser();
  }, []);

  const handleChatSelection = useCallback((chatId: string, chatName: string, participantIds: string[]) => {
    setCurrentChat(chatId);
    setCurrentChatName(chatName);
    setChatParticipants(participantIds);
  }, []);

  if (!isInitialized) {
    return <ChatSkeleton />;
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