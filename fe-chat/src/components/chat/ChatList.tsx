//TODO : add avatar and lastMessage notice
import { ChatService } from '@/services';
import { useEffect, useState } from 'react';
import type { ChatRoom } from '@/types/api';
import ModalCreateGroup from './ModalCreateGroup';
import ModalAddFriend from './ModalAddFriend';
import style from "@/styles/chatList.module.css";
import ChatHeader from '@/components/chat/ChatHeader';

import { useContextMenu } from '@/hooks/useContextMenu';
import ContextMenu from '@/components/ContextMenu';
import { IoExit, IoPeople, IoTrash } from 'react-icons/io5';
//import { AuthService } from '@/services';

interface ChatListProps {
  onButtonClick: (chatId: string, chatName: string, participantIds:string[]) => void;
}

export default function ChatList({ onButtonClick }: ChatListProps) {
  const [chats, setChats] = useState<ChatRoom[]>([]);
  const [openGroupModal, setOpenGroupModal] = useState(false);
  const [openFriendModal, setOpenFriendModal] = useState(false);

  const contextMenu = useContextMenu();

  const handleChatContextMenu = (e: React.MouseEvent, chat: ChatRoom) => {
    e.stopPropagation(); // Evita che apra la chat

    //const currentUserId = AuthService.getCurrentUserId();
    const isGroup = chat.participantIds.length > 2;

    const options = [];

    if (isGroup) {
      options.push({
        label: 'Gestisci membri',
        icon: <IoPeople />,
        onClick: () => {
          console.log('Apri modal gestione membri per:', chat.id);
          // TODO: Implementa modal gestione membri
        }
      });

      options.push({
        label: 'Abbandona gruppo',
        icon: <IoExit />,
        danger: true,
        onClick: async () => {
          if (confirm(`Vuoi abbandonare ${chat.name}?`)) {
            try {
              await ChatService.leaveChat(chat.id);
              setChats(prev => prev.filter(c => c.id !== chat.id));
            } catch (error) {
              console.error('Errore abbandono chat:', error);
            }
          }
        }
      });
    } else {
      options.push({
        label: 'Elimina chat',
        icon: <IoTrash />,
        danger: true,
        onClick: async () => {
          if (confirm(`Vuoi eliminare la chat con ${chat.name}?`)) {
            try {
              await ChatService.deleteChat(chat.id);
              setChats(prev => prev.filter(c => c.id !== chat.id));
            } catch (error) {
              console.error('Errore eliminazione chat:', error);
            }
          }
        }
      });
    }

    contextMenu.openMenu(e, options);
  };

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
        <ModalAddFriend onAddFriendClick={handleOpenFriendModal} onChatCreated={addChat}/>
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
            onContextMenu={(e) => handleChatContextMenu(e, chat)}
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
      <ContextMenu
        isOpen={contextMenu.isOpen}
        position={contextMenu.position}
        options={contextMenu.options}
        onClose={contextMenu.closeMenu}
      />
    </div>
  );
}