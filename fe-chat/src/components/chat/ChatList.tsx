// fe-chat/src/components/chat/ChatList.tsx - AGGIORNATO
import { ChatService } from '@/services';
import { useEffect, useState } from 'react';
import type { ChatRoom } from '@/types/api';
import ModalCreateGroup from './ModalCreateGroup';
import ModalAddFriend from './ModalAddFriend';
import ModalManageMembers from './ModalManageMembers';
import style from "@/styles/chatList.module.css";
import ChatHeader from '@/components/chat/ChatHeader';
import { useContextMenu, ContextMenuActions } from '@/hooks/useContextMenu';
import ContextMenu from '@/components/ContextMenu';

interface ChatListProps {
  onButtonClick: (chatId: string, chatName: string, participantIds: string[]) => void;
}

export default function ChatList({ onButtonClick }: ChatListProps) {
  const [chats, setChats] = useState<ChatRoom[]>([]);
  const [openGroupModal, setOpenGroupModal] = useState(false);
  const [openFriendModal, setOpenFriendModal] = useState(false);
  const [manageMembersChat, setManageMembersChat] = useState<ChatRoom | null>(null);

  const contextMenu = useContextMenu();

  const handleChatContextMenu = (e: React.MouseEvent, chat: ChatRoom) => {
    e.stopPropagation();

    const isGroup = chat.participantIds.length > 2;
    const options = [];

    if (isGroup) {
      options.push(
        ContextMenuActions.manageMembers(() => {
          setManageMembersChat(chat);
        }),
        ContextMenuActions.leaveGroup(chat.name, async () => {
          if (confirm(`Vuoi abbandonare ${chat.name}?`)) {
            try {
              await ChatService.leaveChat(chat.id);
              setChats(prev => prev.filter(c => c.id !== chat.id));
            } catch (error) {
              console.error('Errore abbandono gruppo:', error);
              alert('Errore nell\'abbandono del gruppo');
            }
          }
        })
      );
    } else {
      options.push(
        ContextMenuActions.deleteChat(chat.name, async () => {
          if (confirm(`Vuoi eliminare la chat con ${chat.name}?`)) {
            try {
              await ChatService.deleteChat(chat.id);
              setChats(prev => prev.filter(c => c.id !== chat.id));
            } catch (error) {
              console.error('Errore eliminazione chat:', error);
              alert('Errore nell\'eliminazione della chat');
            }
          }
        })
      );
    }

    contextMenu.openMenu(e, options);
  };

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const userChats = await ChatService.getUserChats();
        setChats(userChats);
      } catch (error) {
        console.error('Errore caricamento chat:', error);
      }
    };

    fetchChats();
  }, []);

  return (
    <div className={style["chat-list"]}>
      {openGroupModal && (
        <ModalCreateGroup 
          onBtnClick={setOpenGroupModal} 
          addChats={(chat) => setChats(prev => [...prev, chat])} 
        />
      )}
      
      {openFriendModal && (
        <ModalAddFriend 
          onAddFriendClick={setOpenFriendModal}
          onChatCreated={(chat) => setChats(prev => [...prev, chat])}
        />
      )}

      {manageMembersChat && (
        <ModalManageMembers
          chatId={manageMembersChat.id}
          chatName={manageMembersChat.name}
          currentMembers={manageMembersChat.participantIds}
          onClose={() => setManageMembersChat(null)}
          onMembersUpdated={() => {
            // Ricarica chat per aggiornare membri
            ChatService.getUserChats().then(setChats);
          }}
        />
      )}

      <ChatHeader
        onBtnClick={setOpenGroupModal}
        onAddFriendClick={setOpenFriendModal}
      />

      <div className={style["chat-item-container"]}>
        {chats.map(chat => (
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
                  {chat.description || 'Nessuna descrizione'}
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