import { GiCrossMark } from "react-icons/gi";
import { UserService } from "@/services";
import { useEffect, useState } from "react";
import { ChatRoom, User } from "@/types/api";
import { ChatService } from "@/services";
import { MdOutlineDone } from "react-icons/md";
import style from "@/styles/modalCreateGroup.module.css";
interface FuncProps {
  onBtnClick: (condition: boolean) => void,
  addChats: (chat: ChatRoom) => void;
}

export default function ModalCreateGroup({ onBtnClick,addChats }: FuncProps) {
  const [friends, setFriends] = useState<User[]>([]);
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [chatName, setChatName] = useState("");
  const [chatDescription, setChatDescription] = useState("");

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        setLoading(true);
        const userFriends = await UserService.getCurrentUserFriends();
        setFriends(userFriends);
      } catch (error) {
        console.error("Errore nel caricamento degli amici:", error);
        setFriends([]);
      } finally {
        setLoading(false);
      }
    };
    fetchFriends();
  }, []);

  const toggleFriendSelection = (friendId: string) => {
    setSelectedFriends(prevSelected => 
      prevSelected.includes(friendId)
        ? prevSelected.filter(id => id !== friendId)
        : [...prevSelected, friendId]
    );
  };
     
  const filteredFriends = friends?.filter(friend =>
    friend.username.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleCreateGroup = async () => {
    try {
      const chat = await ChatService.createChat(chatName, chatDescription, selectedFriends);
      addChats(chat);
      onBtnClick(false);
    } catch (error) {
      console.error("Errore nella creazione del gruppo:", error);
    }
  };

  return (
    <div className={style["create-group-container"]}>
      <div className={style.icon} onClick={() => onBtnClick(false)}>
        <GiCrossMark />
      </div>
      <div className={style.title}>Aggiungi Membri</div>
      <div className={style["group-info"]}>
        <div className={style["info-name"]}>
          <label htmlFor="name"></label>
          <input 
            placeholder="Nome del gruppo"
            type="text" 
            name="name"
            id="name"
            value={chatName}
            onChange={(e)=>setChatName(e.target.value)} />
        </div>
        <div className={style["info-desc"]}>
          <input 
            placeholder="Descrizione del gruppo"
            type="text"
            name="description"
            id="description" 
            value={chatDescription}
            onChange={(e)=>setChatDescription(e.target.value)}/>
        </div>
      </div>
      <div className={style["search-input"]}>
        <input
          type="text"
          placeholder="Cerca membri..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      {selectedFriends.length > 0 && (
        <div className={style["selected-count"]}>{selectedFriends.length} membri selezionati</div>
      )}
      
      <div className={style["member-list"]}>
        {loading ? (
          <div className={style["no-results"]}>Caricamento amici...</div>
        ) : filteredFriends.length > 0 ? (
          filteredFriends.map((friend) => (
            <div className={style["member-item"]} key={friend.id}>
              <div className={style.box} onClick={() => toggleFriendSelection(friend.id)}>
                <input
                  id={`select-friend-${friend.id}`}
                  type="checkbox"
                  checked={selectedFriends.includes(friend.id)}
                  readOnly
                  title={`Seleziona ${friend.username}`}
                />
                {/* ✨ CORREZIONE: Aggiungi label visibile con il nome */}
                <label htmlFor={`select-friend-${friend.id}`}>
                  {friend.username}
                </label>
              </div>
            </div>
          ))
        ) : (
          <div className={style["no-results"]}>
            {searchTerm ? "Nessun amico trovato per la ricerca" : "Nessun amico disponibile"}
          </div>
        )}
      </div>
      
      <div className={style["action-buttons"]}> 
        {selectedFriends.length > 0 && 
          <MdOutlineDone 
            onClick={handleCreateGroup} 
            className={style["create-btn"]}/>
        }
      </div>
    </div>
  );
}