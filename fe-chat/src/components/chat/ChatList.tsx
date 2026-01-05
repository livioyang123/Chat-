//TODO : add avatar and lastMessage notice
import { ChatService } from '@/services';
import { useEffect, useState } from 'react';
import type { ChatRoom } from '@/types/api';
import ModalCreateGroup from './ModalCreateGroup';
import ModalAddFriend from './ModalAddFriend';
import style from "@/styles/chatList.module.css";
import ChatHeader from '@/components/chat/ChatHeader';

interface ChatListProps {
  onButtonClick: (chatId: string, chatName: string, participantIds:string[]) => void;
}

export default function ChatList({ onButtonClick }: ChatListProps) {
  const [chats, setChats] = useState<ChatRoom[]>([]);
  const [openGroupModal, setOpenGroupModal] = useState(false);
  const [openFriendModal, setOpenFriendModal] = useState(false);

  const handleOpenGroupModal = (condizion: boolean) => {
    setOpenGroupModal(condizion);
  };

  const handleOpenFriendModal = (condizion: boolean) => {
    setOpenFriendModal(condizion);
  };

  const addChat = (chat: ChatRoom) => {
    setChats(prevChats => [...prevChats, chat]);
  };

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const userChats = await ChatService.getUserChats();
        setChats(userChats); 
      } catch (error) {
        console.error('Errore nel caricamento delle chat:', error);
      }
    };

    fetchChats();
  }, []);

  return (
    <div className={style["chat-list"]}>
      {openGroupModal && (
        <ModalCreateGroup onBtnClick={handleOpenGroupModal} addChats={addChat} />
      )}
      {openFriendModal && (
        <ModalAddFriend onAddFriendClick={handleOpenFriendModal} />
      )}
      <ChatHeader
        onBtnClick={handleOpenGroupModal}
        onAddFriendClick={handleOpenFriendModal}
      />
      <div className={style["chat-item-container"]}>
        {chats && chats.map(chat => (
          <div
            key={chat.id}
            className={style["chat-item"]}
            onClick={() => onButtonClick(chat.id, chat.name, chat.participantIds)}
          >
            
            <div className={style["chat-info"]}>
              <h1 className={style["chat-name"]}>
                {chat.name}
                <br />
                <span className={style["chat-description"]}>
                  {"Descripsion: " + chat.description}
                </span>
              </h1>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}